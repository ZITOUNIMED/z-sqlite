import { DbService } from './lib/db.service';
import { PLATFORM_INITIALIZER, platformCore } from '@angular/core';

platformCore([{
    provide: PLATFORM_INITIALIZER,
    useValue: new DbService()
  },]);