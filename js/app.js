var map;
var markers = [];
var dogRuns = [
    {
        name: 'Tribeca Dog Run',
        address: 'Hudson River Park - Hubert St. & West St.',
        city: 'New York, NY 10013',
        lat: 40.721573,
        lng: -74.012433,
        venueID: '5200025d498e26189aa3d546',
        venueImg: ''
    },
    {
        name: 'Prospect Park Dog Run',
        address: '95 Prospect Park W',
        city: 'Brooklyn, NY 11215',
        lat: 40.665547,
        lng: -73.974015,
        venueID: '4c46ecacc047be9a24d62e79',
        venueImg: ''
    },
    {
        name: 'Pier 84 Dog Run',
        address: 'Hudson River Park - 12th Ave. & W 44th St.',
        city: 'New York, NY 10036',
        lat: 40.763266,
        lng: -73.999872,
        venueID: '4c0307e9187ec9283128b57b',
        venueImg: ''
    },
    {
        name: 'Washington Square Park Dog Run',
        address: 'W 4th St. & Thompson St.',
        city: 'New York, NY 10012',
        lat: 40.730823,
        lng: -73.997332,
        venueID: '43768200f964a520472a1fe3',
        venueImg: ''

    },
    {
        name: 'Jemmy\'s Dog Run',
        address: 'Madison Square Park - 25th St. & Broadway',
        city: 'New York, NY 10012',
        lat: 40.740783,
        lng:  -73.987563,
        venueID: '4a5a3dc2f964a520f7b91fe3',
        venueImg: ''

    },
    {
        name: 'West 87th Street Dog Run',
        address: 'W 87th St. & Riverside Dr.',
        city: 'New York, NY 10024',
        lat: 40.790619,
        lng: -73.979890,
        venueID: '4a6b7e70f964a520c5ce1fe3',
        venueImg: ''
    },
    {
        name: 'Msgr. McGolrick Park Dog Run',
        address: 'N Henry St and Driggs Ave.',
        city: 'New York, NY 11222',
        lat: 40.723184,
        lng: -73.943146,
        venueID: '4c0bcb9d6071a59335bbe132',
        venueImg: ''
    },
    {
        name: 'Peter Detmold Park Dog Run',
        address: '454 E 51st St.',
        city: 'New York, NY 10022',
        lat: 40.753123,
        lng: -73.964090,
        venueID: '4b588a79f964a520e65c28e3',
        venueImg: ''
    }
];

//Creates and initializes Google maps
function mapInit() {
    var nyc = new google.maps.LatLng(40.712784, -74.005941);
    map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: nyc,
        zoom: 13,
        disableDefaultUI: true
    });
    var infowindow = new google.maps.InfoWindow();
    //Creates markers for each dog run and pushes to markers array
    for (var i = 0; i < dogRuns.length; i++) {
        var marker = new google.maps.Marker({
            name: dogRuns[i].name,
            position: new google.maps.LatLng(dogRuns[i].lat, dogRuns[i].lng),
            map: map,
            animation: google.maps.Animation.DROP
        });
        markers.push(marker);
        //Creates an info window containing dog run information when each marker is clicked
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                //Sets bounce animation when marker is clicked
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){marker.setAnimation(null);}, 700);
                //Sets info window content
                var infoName = '<h1>' + dogRuns[i].name + '</h1>';
                var infoAddress = '<p>' + dogRuns[i].address + '<br>' + dogRuns[i].city + '</br>' + '</p>';
                var infoImg = '<img src=' + dogRuns[i].venueImg + '>';
                var src = '<p><span>Source: Foursquare</span></p>';
                infowindow.setContent(infoName + infoAddress + infoImg + src);
                infowindow.open(map, marker);
            }
        })(marker, i));
    }
}

//Foursquare API and AJAX get request for user uploaded images
function getData() {
    var clientID = 'AEN5HKSFSGN4AK4G4A40F2UZDCSAZWF2OBTAAYFKQXBB3DWX';
    var clientSecret = 'F5RDMCOFLHWMTZB3QKFE4SOSYQXC5W3OQOEQ0K2C0ZZWCHTV';
    var fsVersion = '&v=20140806';
    var fsM = '&m=foursquare'
    var fsURL;
    var fsID;
    var imgPrefix = 'https://irs0.4sqi.net/img/general/200x200';

    dogRuns.forEach(function(dogRun) {
        fsID = dogRun.venueID;
        fsURL = 'https://api.foursquare.com/v2/venues/' + fsID + '/photos' + '?&client_id=' + clientID + '&client_secret=' + clientSecret + fsVersion + fsM;
        $.ajax({
            url: fsURL,
            dataType: "json",
            success: function (data) {
                //Chooses a random image from the 10 most recent photos taken at the selected dog run
                var randImg = Math.floor((Math.random() * 10) + 1);
                var imgSuffix = (data.response.photos.items[randImg].suffix);
                dogRun.venueImg = (imgPrefix + imgSuffix);
            }
        }).fail(function(e){
            alert('Foursquare API could not be loaded');
        })
    })
}

function mapViewModel() {
    var self = this;

    //Creates an observable array and passes dog run information
    self.allRuns = ko.observableArray([]);
    dogRuns.forEach(function(dogRun) {
        self.allRuns.push(dogRun);
    })

    //Triggers a Google map marker when corresponding name is clicked on the list
    self.clickMarker = function (dogRun) {
        markers.forEach(function(marker) {
            if (dogRun.name === marker.name) {
                google.maps.event.trigger(marker, 'click');
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){marker.setAnimation(null);}, 700);
            }
        })
    }

    //Creates a new array of visible dog runs
    self.visibleRuns = ko.observableArray([]);
        self.allRuns().forEach(function(run) {
            self.visibleRuns.push(run);
        });

    //Data binds user search input with ViewModel as the user types
    self.searchTerm = ko.observable("");

    //Dynamically filters through the list of dog runs
    self.filter = function () {
        var searchTerm = self.searchTerm().toLowerCase();
        //Clears all dog run information and markers when user begins to filter
        self.visibleRuns.removeAll();
        markers.forEach(function(marker) {
            marker.setVisible(false);
        });
        //Sets dog run information as per the user's filter terms
        self.allRuns().forEach(function(run) {
            if (run.name.toLowerCase().indexOf(searchTerm) !== -1) {
                self.visibleRuns.push(run);
            }
        });
        //Sets markers visible as per the user's filter terms
        markers.forEach(function(marker) {
            if(marker.name.toLowerCase().indexOf(searchTerm) !== -1) {
                marker.setVisible(true);
            }
        });
    }
}

ko.applyBindings(new mapViewModel());
getData();



