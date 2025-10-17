import { jwtDecode } from "jwt-decode";
import type { TokenDto } from "../Dtos/Token.dto";
import type { UserPaylodDto } from "../Dtos/UserPayload.dto";

export const token: TokenDto = JSON.parse(localStorage.getItem('token')!) ?? undefined

export const userPayload: UserPaylodDto | undefined = token ? jwtDecode(token.accessToken) : undefined

