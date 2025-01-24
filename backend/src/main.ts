import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {ValidationPipe} from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import {promises as fsPromises} from "fs";
import * as path from "path";
import {SESSION_COOKIE_NAME} from "./auth/auth.service";
import {WsAdapter} from "@nestjs/platform-ws";
import {ConfigService} from "@nestjs/config";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, process.env.NODE_ENV === "development" ? {
        cors: {
            allowedHeaders: ["Cookie", "Content-Type"],
            credentials: true,
            origin: "http://localhost:3000",
        }
    } : undefined);

    app.use(cookieParser());
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new ValidationPipe());
    app.useWebSocketAdapter(new WsAdapter(app));

    const configService = app.get(ConfigService);
    const redisUrl = new URL(configService.getOrThrow("REDIS_URL"));

    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.REDIS,
        options: {
            host: redisUrl.hostname,
            port: parseInt(redisUrl.port),
            username: redisUrl.username,
            password: redisUrl.password,
            wildcards: true
        }
    });

    const config = new DocumentBuilder()
        .setTitle("Metar recordings viewer")
        .setDescription('Metar recordings viewer')
        .setVersion('1.0')
        .addCookieAuth(SESSION_COOKIE_NAME)
        .build();
    const document = SwaggerModule.createDocument(app, config);

    if (process.env.NODE_ENV === "development") {
        await fsPromises.writeFile(path.join(process.cwd(), "openapi.json"), JSON.stringify(document, null, 4));
    }

    SwaggerModule.setup('swagger', app, document, {
        useGlobalPrefix: true
    });

    await app.startAllMicroservices();
    await app.listen(3001);
}

bootstrap();
