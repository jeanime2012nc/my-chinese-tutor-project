import { Global, Module } from '@nestjs/common';
import { getSupabaseClient } from './supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      useFactory: (): SupabaseClient => {
        return getSupabaseClient();
      },
    },
  ],
  exports: [SUPABASE_CLIENT],
})
export class DatabaseModule {}