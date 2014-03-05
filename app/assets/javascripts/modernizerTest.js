function parseModernizerResults() {
  var contents = "<table class=\"table table-striped table-bordered table-condensed table-responsive\" style=\"margin-bottom:0px;\"><tr><th>Feature</th><th>Supported?</th></tr>";
  $(document.documentElement.className.trim().split(" ")).each(function(k, v) {
    console.log((v.match(/^no-/) ? v.substr(3) + ": no" : v + ": yes"));
	contents = contents + "<tr><td>" + (v.match(/^no-/) ? v.substr(3) + "</td><td><i class=\"icon-warning-sign\" style=\"color:orange\" title=\"unsupported\"></i>" : v + "</td><td><i class=\"icon-ok\" style=\"color:green\" title=\"supported\"></i>") + "</td></tr>";
  });
  contents = contents + "</table>";
  $('#browser-modal-contents').html(contents);
  $('#browser-modal').modal();
}