// src/coupons/dto/update-coupon.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateCouponDto } from './create-coupon.dto';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
