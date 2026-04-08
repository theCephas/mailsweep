import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { User } from "@prisma/client";
import { JwtPayload, UserResponse } from "src/types";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateGoogleUser(
    profile: any,
    accessToken: string,
    refreshToken?: string
  ): Promise<User> {
    const email = profile.emails[0].value;
    const googleId = profile.id;

    // Check if user exists
    const existing = await this.usersService.findByGoogleId(googleId);

    if (!refreshToken || refreshToken === 'placeholder') {
      // If no refresh token provided, check if we have an existing one
      if (existing && existing.refreshToken && existing.refreshToken !== 'placeholder') {
        // Use existing refresh token
        return this.usersService.createOrUpdate({
          email,
          googleId,
          accessToken,
          refreshToken: existing.refreshToken,
        });
      } else {
        // No valid refresh token available - user needs to re-authorize
        throw new UnauthorizedException(
          'Refresh token required. Please revoke MailSweep access at https://myaccount.google.com/permissions and sign in again.'
        );
      }
    }

    // We have a valid refresh token
    return this.usersService.createOrUpdate({
      email,
      googleId,
      accessToken,
      refreshToken,
    });
  }

  async login(user: User): Promise<{ token: string; user: UserResponse }> {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  getUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
