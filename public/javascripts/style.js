$(function () {

  /** Mobile Menu */
  $('button[aria-controls="navbarSupportedContent"]').on('click', function () {
    if (!$(".offcanvas-collapse").hasClass('open')) {
      $(".offcanvas-collapse").addClass('open')
      $(".menu-overlay").fadeIn(500);
    } else {
      $(".offcanvas-collapse").removeClass('open')
      $(".menu-overlay").fadeOut(500);
    }
  });
  $(".menu-overlay").click(function (event) {
    $(".offcanvas-collapse").removeClass('open')
    $(".menu-overlay").fadeOut(500);
  });

  // Select2
  $('.select2').select2();

  // put all that "wl_alert" code here
  from = $('#DepartDate').datepicker({
    uiLibrary: 'bootstrap4',
    format: 'yyyy/mm/dd',
    minDate: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
  });

  function getDate(element) {
    var date;
    try {
      date = $.datepicker.parseDate(dateFormat, element.value);
    } catch (error) {
      date = null;
    }
    return date;
  }
});

// AJAX
function getAjax(inputOption) {
  $('.loading').addClass('show');
  var element = inputOption.element || "body";
  var defaultOption = {
    type: "GET",
    url: '',
    data: {},
    contentType: "application/json; charset=utf-8",
    dataType: "html",
    success: function (response) {
      $(element).html(response);
      return true;
    },
    error: function (xhr, status, error) {
      console.log(xhr);
      $(element).html('<div class="alert alert-danger" role="alert">' + error + '</div>');
      return false;
    },
    complete(xhr, status) {
      $('.loading').removeClass('show');
    }
  };
  var option = $.extend({}, defaultOption, inputOption);
  $.ajax(option);
};

// Query String: url || current windows location
function getQueryValue(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}