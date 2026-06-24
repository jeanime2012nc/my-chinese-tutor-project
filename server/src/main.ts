import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import * as express from 'express';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { config } from 'dotenv';
import { resolve } from 'path';
import { HttpStatusInterceptor } from '@/interceptors/http-status.interceptor';

// 加载 .env 文件（本地开发用，生产环境通过平台环境变量）
const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}

function parsePort(): number {
  // 优先使用 SERVER_PORT（独立于 web 服务的 PORT 变量）
  if (process.env.SERVER_PORT) {
    const port = parseInt(process.env.SERVER_PORT, 10);
    if (!isNaN(port) && port > 0 && port < 65536) return port;
  }
  // 再尝试 PORT（但跳过 dev_run.sh 设置的 5000，那是 web 服务的端口）
  if (process.env.PORT) {
    const port = parseInt(process.env.PORT, 10);
    if (!isNaN(port) && port > 0 && port < 65536 && port !== 5000) return port;
  }
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('-p');
  if (portIndex !== -1 && args[portIndex + 1]) {
    const port = parseInt(args[portIndex + 1], 10);
    if (!isNaN(port) && port > 0 && port < 65536) return port;
  }
  return 3000;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // 全局拦截器：统一将 POST 请求的 201 状态码改为 200
  app.useGlobalInterceptors(new HttpStatusInterceptor());
  app.enableShutdownHooks();

  const port = parsePort();
  try {
    await app.listen(port);
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 端口 ${port} 被占用! 请运行 'npx kill-port ${port}' 然后重试。`);
      process.exit(1);
    } else {
      throw err;
    }
  }
  console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();