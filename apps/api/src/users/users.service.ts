import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { googleId },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createOrUpdate(data: {
    email: string;
    googleId: string;
    accessToken: string;
    refreshToken: string;
  }): Promise<User> {
    const existingUser = await this.findByGoogleId(data.googleId);

    if (existingUser) {
      // Only update refreshToken if a real one is provided
      const updateData: any = {
        accessToken: data.accessToken,
      };

      if (data.refreshToken && data.refreshToken !== 'placeholder') {
        updateData.refreshToken = data.refreshToken;
      }

      return this.prisma.user.update({
        where: { id: existingUser.id },
        data: updateData,
      });
    }

    return this.prisma.user.create({
      data: {
        email: data.email,
        googleId: data.googleId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    });
  }

  async updateTokens(userId: string, accessToken: string, refreshToken: string): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        accessToken,
        refreshToken,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
