import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import initMaps = require('../../../../assets/js/init/initMaps.js');
import { NewpostService } from './newpost.service';
import { Router, ActivatedRoute } from '@angular/router';
import initNotifySuccess = require('../../../../assets/js/init/notify-success.js');
import { NgForm } from "@angular/forms";
import * as firebase from 'firebase';
import { FirebaseApp } from 'angularfire2';
import { Observable } from 'rxjs';
import { Ng2ImgMaxService } from 'ng2-img-max';
declare var $: any;
declare var google;

/**
 * Models
 */
export class House {
  id_landord: object;
  status: string;
  longitude: number;
  latitude: number;
  price: number;
  image: string;
  title: string;
  description: string;
  address: string;
  range: number;
  rate: number;
  service_price: Service_Price
}
export class Service_Price {
  electricity_price: number;
  water_price: number;
  internet_price: number;
  garbage_price: number;
}

@Component({
  selector: 'app-newpost',
  templateUrl: './newpost.component.html',
  styleUrls: ['./newpost.component.css'],
  providers: [NewpostService]
})
export class NewpostComponent implements OnInit, AfterViewInit {
  urlarray: string;

  private _id: object;
  //private house: any;
  house: House = null;
  public statuses = [{ name: "Mới" }, { name: "Cũ" }];

  public lng: number;
  public lat: number;
  public ad: string; // chứa giá trị address

  url = '';
  image: any;
  folder = 'images-house';
  files: File;
  filesToUpload: Array<File>;

  // google map
  myLatLng: any;

  constructor( @Inject(FirebaseApp) firebaseApp: any,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private newpostService: NewpostService,
    private ng2ImgMaxService: Ng2ImgMaxService
  ) { }

  ngOnInit() {
    this.house = new House();
    this.house.service_price = new Service_Price();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  SaveForm(f: NgForm) {
    //console.log(f.value);
    this.house.service_price.electricity_price = f.value.electricity_price;
    this.house.service_price.water_price = f.value.water_price;
    this.house.service_price.internet_price = f.value.internet_price;
    this.house.service_price.garbage_price = f.value.garbage_price;
    this.house.image = this.url;
    this.house.latitude = this.lat;
    this.house.longitude = this.lng;
    this.house.address = this.ad;
    this.house.rate = 5;
    this.house.id_landord = this.newpostService.id;
    console.log(this.house);
    this.newpostService.Add(this.house).subscribe((response) => {
      if (response) {
        initNotifySuccess('Add success', 'success');
        //console.log(response);
        this.router.navigate(['/dashboard/manageposts/listhouse']);
      }
    })

  }

  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
    /**
     * Call Thang's promise service to uploadImages
     */
    // this.newpostService.uploadImages(this.filesToUpload).then((concatUrl) => {
    //   console.log("Link du kien: ");
    //   console.log(concatUrl);
    // });


    console.log(this.filesToUpload);
    let temp_path = '';
    for (var index = 0; index < this.filesToUpload.length; index++) {
      this.ng2ImgMaxService.resize([this.filesToUpload[index]], 800, 450).subscribe((result) => {
        var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
          imgUrl = '';
        for (var i = 0; i < 6; i += 1) {
          imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        let storageRef = firebase.storage().ref();
        let path = `/${this.folder}/${imgUrl + ".jpg"}`;
        let iRef = storageRef.child(path);
        iRef.put(result).then((snapshot) => {
          temp_path = snapshot.downloadURL;
          this.url += temp_path + ";";
          console.log(this.url);
        });
      });
    }

  }


  initMap() {
    this.myLatLng = { lat: 10.850542, lng: 106.772242 };
    (<HTMLInputElement>document.getElementById("lat")).value = this.myLatLng.lat;
    (<HTMLInputElement>document.getElementById("lng")).value = this.myLatLng.lng;
    var map = new google.maps.Map(document.getElementById('mymap'), {
      zoom: 14,
      center: this.myLatLng
    });

    // Place a draggable marker on the map
    var marker = new google.maps.Marker({
      position: this.myLatLng,
      map: map,
      draggable: true,
      title: "Drag and drop the marker to select the position!"
    });

    var geocoder = new google.maps.Geocoder;

    let that = this;
    google.maps.event.addListener(marker, 'dragend', function () {
      that.lat = this.getPosition().lat();
      (<HTMLInputElement>document.getElementById("lat")).value = this.getPosition().lat();
      that.lng = this.getPosition().lng();
      (<HTMLInputElement>document.getElementById("lng")).value = this.getPosition().lng();

      var temp_latlng = { lat: that.lat, lng: that.lng };
      geocoder.geocode({ 'location': temp_latlng }, function (results, status) {
        if (status === 'OK') {
          if (results[1]) {
            (<HTMLInputElement>document.getElementById("address")).value = results[0].formatted_address;
            that.ad = results[0].formatted_address;
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      });

    });

    var input = document.getElementById('address');
    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', function () {
      var place = autocomplete.getPlace();
      console.log(place);
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        console.log(place.geometry.location);
        //map.setZoom(17);  // Why 17? Because it looks good.
      }
      marker.setPosition(place.geometry.location);
      that.lat = place.geometry.location.lat();
      (<HTMLInputElement>document.getElementById("lat")).value = place.geometry.location.lat();
      that.lng = place.geometry.location.lng();
      (<HTMLInputElement>document.getElementById("lng")).value = place.geometry.location.lng();
      that.ad = place.formatted_address;
    });
  }
}
