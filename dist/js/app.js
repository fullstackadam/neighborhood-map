
const NAV=new NavVM();const LIST=new ListVM();const MAP=new MapVM();function googleSuccess(){MAP.googleMapsLoaded(true);}
function googleError(){MAP.loadingState('ERROR: could not load gmaps api');}
$(".navBind").each(function(){ko.applyBindings(NAV,this);});ko.applyBindings(LIST,document.getElementById('list'));ko.applyBindings(MAP,document.getElementById('map'));$('body').bootstrapMaterialDesign();