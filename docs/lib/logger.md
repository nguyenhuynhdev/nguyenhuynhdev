# logger

Exports: `logger`

Simple console wrapper with environment-aware `debug` logging.

## API
```ts
logger.info(...args: any[]): void
logger.warn(...args: any[]): void
logger.error(...args: any[]): void
logger.debug(...args: any[]): void // only outputs in development
```

## Usage
```ts
import { logger } from "@/lib/logger";

logger.info("Starting app");
logger.debug({ data });
```
