import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { Menu, User, Role } from '../models/models';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent implements OnInit {
  title:string="Header Title"
  menus: Menu[] = [];
  firebaseUser: any = undefined;
  user: User = undefined;

  constructor(public auth: AngularFireAuth, public firestore: FirestoreService, public router: Router) {
    this.auth.authState.subscribe((res) => {
      console.log("Auth State Changed : ", res);
      this.auth.currentUser.then(user => {
        console.log("Current Firebase User : ", user);
        this.firebaseUser = user;
        if (user != null) {
          this.handleSuccessLogin(user);
        } else {
          this.handleNotLoggedIn();
        }
      });
    });


  }

  ngOnInit(): void {

  }

  handleSuccessLogin(res: any) {
    this.firestore.userRef.doc(res.uid).valueChanges().subscribe((user: User) => {
      console.log("User value Changed ", user)
      if (this.firebaseUser != null) {
        if (user != null) {
          this.firestore.setUser(user);
          this.user = this.firestore.user;
          console.log("User Logged In Success : ", this.user);
          this.refresh();
        }
        else {
          var date = new Date().toDateString();
          this.user = { id: res.uid,name: res.displayName, email: res.email, pic: res.photoURL, phone: res.phoneNumber, role: Role.USER, address: "", created: date, updated: date,notifications:false };
          console.log("Creatig the New User : ", this.user);
          this.firestore.userRef.doc(res.uid).set(this.user);
        }
      }
    });
  }

  refresh() {
    this.menus = [];
    if (this.firestore.user != null) {
      this.menus.push({ name: "Dashboard", click: undefined, route: "dashboard", icon: "dashboard" });
      this.menus.push({ name: "Profile", click: undefined, route: "profile", icon: "person" });
      this.menus.push({ name: "Logout", click: "this.logout()", route: undefined, icon: "logout" });
      this.router.navigate(['dashboard']);
    } else {
      this.menus = [];
      this.menus.push({ name: "Login", click: undefined, route: "login", icon: "login" });
      this.router.navigate(['']);
    }
  }

  handleNotLoggedIn() {
    this.firestore.user = null;
    this.refresh();
  }

  click(text: string) {
    eval(text);
  }

  logout() {
    this.auth.signOut();
  }

}
