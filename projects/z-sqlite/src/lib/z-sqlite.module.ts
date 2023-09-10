import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SQLite } from '@ionic-native/sqlite/ngx';
import { BrowserModule } from '@angular/platform-browser';
import { DbService } from './db.service';
import { DbComponent } from './db/db.component';



@NgModule({
  declarations: [
    DbComponent
  ],
  imports: [
    CommonModule,
  ], 
  providers:  [SQLite, 
    { 
      provide: APP_INITIALIZER, 
      useFactory: () => {console.log('init 666666666')}, 
    },
  ],
})
export class ZSQLiteModule { 
}
