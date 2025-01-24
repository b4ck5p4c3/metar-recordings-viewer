import {Injectable} from "@nestjs/common";
import {OIDCService} from "../oidc/oidc.service";
import {ConfigService} from "@nestjs/config";
import {HttpService} from "@nestjs/axios";

@Injectable()
export class LogtoAuthService extends OIDCService {

    constructor(private configService: ConfigService,
                httpService: HttpService) {
        super({
            issuer: configService.getOrThrow("LOGTO_ISSUER"),
            clientId: configService.getOrThrow("LOGTO_CLIENT_ID"),
            clientSecret: configService.getOrThrow("LOGTO_CLIENT_SECRET")
        }, httpService);
    }
}