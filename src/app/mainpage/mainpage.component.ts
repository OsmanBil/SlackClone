import { AfterViewInit, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { DialogEditUserComponent } from '../dialog-edit-user/dialog-edit-user.component';
import { AuthService } from '../services/auth.service';
import { SearchService } from '../services/search.service';
import { SidenavToggleService } from '../services/sidenav-toggle.service';
import { User } from '../services/user';


@Component({
  selector: 'app-mainpage',
  templateUrl: './mainpage.component.html',
  styleUrls: ['./mainpage.component.scss']
})
export class MainpageComponent implements OnInit, AfterViewInit {

  
  users = [];
  currentUserId = '';
  currentUser: User;
  searchText: string = '';
  innerWidth: number;

  @ViewChild('drawer') public drawer: MatDrawer;
  @HostListener('window:resize', ['$event'])
  onResize() {
  this.innerWidth = window.innerWidth;
}
 
  constructor(
    public authService: AuthService, 
    private firestore: AngularFirestore, 
    private dialog: MatDialog,
    private search: SearchService,
    public sidenavService: SidenavToggleService) { }


  ngOnInit(): void {
    this.getCurrentUser();
    this.innerWidth = window.innerWidth;
  }


  ngAfterViewInit(): void {
    this.sidenavService.setSidenav(this.drawer);
  }


  getCurrentUser(){
    this.firestore
      .collection('users')
      .valueChanges({ idField: 'userId' })
      .subscribe((users: any) => {
        this.users = users;
        this.getCurrentUserId();
      })
     
  }


  getCurrentUserId() {
    let currentUser = localStorage.getItem('user');
    currentUser = JSON.parse(currentUser);
    if (currentUser == null) {
      // nothing happen
    } else {
      this.currentUserId = currentUser['uid'];
    }

    this.setCurrentUser();
  }


  setCurrentUser() {
    let currentUser = this.users.filter((user: any) => user['uid'] == this.currentUserId);
    this.currentUser = currentUser[0];
  }


  openSettings() {
    let dialog = this.dialog.open(DialogEditUserComponent);
    dialog.componentInstance.user = this.currentUser;
    dialog.componentInstance.userId = this.currentUserId;
  }

  
  onSearchTextEnter(searchValue: string){
    this.searchText = searchValue;
    this.search.sendData(this.searchText);
  }


  toggleSideNavWithIcon(){
    if(this.innerWidth < 910){
      this.sidenavService.toggle();
    }
    else{
      this.drawer.toggle();
    }
  }
}
