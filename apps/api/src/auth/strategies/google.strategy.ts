import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      clientID: configService.get<string>("GOOGLE_CLIENT_ID"),
      clientSecret: configService.get<string>("GOOGLE_CLIENT_SECRET"),
      callbackURL: configService.get<string>("GOOGLE_CALLBACK_URL"),
      scope: [
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://mail.google.com/",
      ],
      passReqToCallback: false,
    });
  }

  // Override authorizationParams to force refresh token
  authorizationParams(): { [key: string]: string } {
    return {
      access_type: "offline",
      prompt: "consent",
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    try {
      // Log for debugging
      console.log("Google OAuth - Received refresh token:", !!refreshToken);
      console.log("Google OAuth - Access token:", !!accessToken);

      const user = await this.authService.validateGoogleUser(
        profile,
        accessToken,
        refreshToken
      );
      done(null, user);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Google OAuth validation error:", error.message);
      } else {
        console.error("Google OAuth validation error:", error);
      }
      done(error, null);
    }
  }
}
