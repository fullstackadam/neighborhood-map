
const LOCATION=new LocationModel();const PLACE=new PlaceModel();const NavViewI=new NavView();const ListViewI=new ListView();const MapViewI=new MapView();ko.applyBindings(LOCATION,document.getElementById('locationModel'));ko.applyBindings(PLACE,document.getElementById('placeModel'));ko.applyBindings(NavViewI,document.getElementById('nav'));ko.applyBindings(ListViewI,document.getElementById('list'));ko.applyBindings(MapViewI,document.getElementById('map'));