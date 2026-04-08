import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { UsersService } from "../users/users.service";
import { User } from "@prisma/client";
import { EmailItem, SearchEmailsResponse, BulkActionResponse } from "src/types";
import { format } from "date-fns";

@Injectable()
export class GmailService {
  constructor(private usersService: UsersService) {}

  private chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  }

  private throwGmailError(error: any, fallbackMessage: string): never {
    const status = error?.response?.status ?? error?.code;
    const apiMessage =
      error?.response?.data?.error?.message || error?.message || fallbackMessage;

    if (apiMessage === "invalid_grant") {
      throw new UnauthorizedException(
        "Google authorization expired or was revoked. Please reconnect your Google account."
      );
    }

    console.error("Gmail API error:", {
      status,
      message: apiMessage,
      data: error?.response?.data,
    });

    if (status === 400) {
      throw new BadRequestException(apiMessage);
    }
    if (status === 401) {
      throw new UnauthorizedException(apiMessage);
    }
    if (status === 403) {
      const permissionHint = /insufficient|permission|scope/i.test(apiMessage)
        ? "Insufficient Gmail permissions. Please reconnect your Google account."
        : apiMessage;
      throw new ForbiddenException(permissionHint);
    }
    if (status === 404) {
      throw new NotFoundException(apiMessage);
    }
    if (status === 429) {
      throw new HttpException(apiMessage, HttpStatus.TOO_MANY_REQUESTS);
    }

    throw new InternalServerErrorException(fallbackMessage);
  }

  private getOAuth2Client(user: User): OAuth2Client {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL
    );

    if (!user.refreshToken || user.refreshToken === "placeholder") {
      throw new UnauthorizedException(
        "Google refresh token missing or invalid. Please reconnect your Google account."
      );
    }

    oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    });

    // Handle token refresh
    oauth2Client.on("tokens", async (tokens) => {
      if (tokens.refresh_token) {
        await this.usersService.updateTokens(
          user.id,
          tokens.access_token!,
          tokens.refresh_token
        );
      } else if (tokens.access_token) {
        await this.usersService.updateTokens(
          user.id,
          tokens.access_token,
          user.refreshToken
        );
      }
    });

    return oauth2Client;
  }

  async searchEmails(
    user: User,
    sender: string,
    fromDate: string,
    toDate: string
  ): Promise<SearchEmailsResponse> {
    try {
      const oauth2Client = this.getOAuth2Client(user);
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      // Build Gmail query string
      const fromFormatted = format(new Date(fromDate), "yyyy/MM/dd");
      const toFormatted = format(new Date(toDate), "yyyy/MM/dd");
      const query = `from:${sender} after:${fromFormatted} before:${toFormatted}`;

      const emails: EmailItem[] = [];
      let pageToken: string | undefined;

      // Fetch all emails (handle pagination)
      do {
        const response = await gmail.users.messages.list({
          userId: "me",
          q: query,
          maxResults: 500,
          pageToken,
        });

        if (response.data.messages && response.data.messages.length > 0) {
          // Fetch full details for each message
          const messageDetails = await Promise.all(
            response.data.messages.map(async (message) => {
              const detail = await gmail.users.messages.get({
                userId: "me",
                id: message.id!,
                format: "metadata",
                metadataHeaders: ["From", "Subject", "Date"],
              });

              const headers = detail.data.payload?.headers || [];
              const fromHeader =
                headers.find((h) => h.name === "From")?.value || "";
              const subjectHeader =
                headers.find((h) => h.name === "Subject")?.value || "";
              const dateHeader =
                headers.find((h) => h.name === "Date")?.value || "";

              // Extract sender email and name
              const senderMatch = fromHeader.match(/<(.+?)>/);
              const senderEmail = senderMatch ? senderMatch[1] : fromHeader;
              const senderName = fromHeader.replace(/<.+?>/, "").trim();

              return {
                id: detail.data.id!,
                threadId: detail.data.threadId!,
                sender: senderName || senderEmail,
                senderEmail,
                subject: subjectHeader,
                snippet: detail.data.snippet || "",
                date: dateHeader,
                internalDate: detail.data.internalDate || "",
              };
            })
          );

          emails.push(...messageDetails);
        }

        pageToken = response.data.nextPageToken ?? undefined;
      } while (pageToken);

      return {
        emails,
        total: emails.length,
      };
    } catch (error) {
      this.throwGmailError(error, "Failed to search emails");
    }
  }

  async trashEmails(user: User, ids: string[]): Promise<BulkActionResponse> {
    try {
      if (!ids || ids.length === 0) {
        throw new BadRequestException("No email ids provided");
      }

      const oauth2Client = this.getOAuth2Client(user);
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      // Gmail API limits batch operations to 1000 ids
      const chunks = this.chunk(ids, 1000);
      for (const chunk of chunks) {
        await gmail.users.messages.batchModify({
          userId: "me",
          requestBody: {
            ids: chunk,
            addLabelIds: ["TRASH"],
            removeLabelIds: ["INBOX"],
          },
        });
      }

      return {
        success: true,
        count: ids.length,
        message: `${ids.length} email(s) moved to trash`,
      };
    } catch (error) {
      this.throwGmailError(error, "Failed to trash emails");
    }
  }

  async deleteEmails(user: User, ids: string[]): Promise<BulkActionResponse> {
    try {
      if (!ids || ids.length === 0) {
        throw new BadRequestException("No email ids provided");
      }

      const oauth2Client = this.getOAuth2Client(user);
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      // Gmail API limits batch operations to 1000 ids
      const chunks = this.chunk(ids, 1000);
      for (const chunk of chunks) {
        await gmail.users.messages.batchDelete({
          userId: "me",
          requestBody: {
            ids: chunk,
          },
        });
      }

      return {
        success: true,
        count: ids.length,
        message: `${ids.length} email(s) permanently deleted`,
      };
    } catch (error) {
      this.throwGmailError(error, "Failed to delete emails");
    }
  }

  async getEmailPreview(user: User, id: string) {
    try {
      const oauth2Client = this.getOAuth2Client(user);
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      const message = await gmail.users.messages.get({
        userId: "me",
        id,
        format: "full",
      });

      const headers = message.data.payload?.headers || [];
      const fromHeader = headers.find((h) => h.name === "From")?.value || "";
      const subjectHeader =
        headers.find((h) => h.name === "Subject")?.value || "";
      const dateHeader = headers.find((h) => h.name === "Date")?.value || "";

      // Extract sender
      const senderMatch = fromHeader.match(/<(.+?)>/);
      const sender = senderMatch ? senderMatch[1] : fromHeader;

      // Get body
      let body = message.data.snippet || "";
      if (message.data.payload?.parts) {
        const textPart = message.data.payload.parts.find(
          (part) => part.mimeType === "text/plain"
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
        }
      } else if (message.data.payload?.body?.data) {
        body = Buffer.from(message.data.payload.body.data, "base64").toString(
          "utf-8"
        );
      }

      return {
        id: message.data.id!,
        subject: subjectHeader,
        snippet: message.data.snippet || "",
        body,
        sender,
        date: dateHeader,
      };
    } catch (error) {
      this.throwGmailError(error, "Failed to fetch email preview");
    }
  }
}
