import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root'
})
export class SidenavToggleService {

  private sidenavDrawer: MatDrawer;
  private threadDrawer: MatDrawer;


  public setSidenav(drawer: MatDrawer) {
    this.sidenavDrawer = drawer;
  }


  public setThread(drawer: MatDrawer) {
    this.threadDrawer = drawer;
  }

  public openSidenav() {
    this.sidenavDrawer.open();
    this.closeThread();
  }

  public openThread() {
    this.threadDrawer.open()
    this.closeSidenav();
  }


  public closeSidenav() {
    return this.sidenavDrawer.close();
  }


  public closeThread() {
    if(this.threadDrawer){
    this.threadDrawer.close();
    }
  }


  public toggle(): void {
    this.sidenavDrawer.toggle();
    this.closeThread();
  }
}
