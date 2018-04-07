var data_value = "";
var pro_data;
$(document).ready(function () {
  $.ajax({
    type: "GET",
    url: "https://script.google.com/macros/s/AKfycbzqckm9nEied8AYoinRm9xx7JBc__1c1EU7OgAAcZuXS3F-wcGT/exec",
    dataType: "json",
    success: function (data) {
      $.each(data.list, function (i, data) {

        data_value = data_value + "<option id=" + data.product + " value=" + data.product + ">" + data.qty + "</option>";

      });
      pro_data = data;
      alert("Products and stock Quantity Loaded");
    }
  });
});



var template = "\n  <td></td>\n  <td>\n    <input type=\"text\" id=\"name\" list=\"data\" name=\"Product Name\" required /> <datalist id=\"data\"></datalist>\n  </td>\n  <td>\n    <input type=\"number\" id=\"quantity\" name=\"Quantity\" required />\n  </td>\n  <td>\n    <input type=\"number\" id=\"price\" step=\"any\" name=\"Price\" required />\n  </td>\n  <td></td>\n  <td class=\"action\">\n  <button class=\"primary\" title=\"Add Product\" id=\"save\">\n  Save\n  </button>\n  </td>\n";

var addButton = document.getElementById("add");
addButton.addEventListener("click", addItem);

var tableBody = document.getElementById("body");
var snackbar = document.getElementById("snackbar");

function multiply(num1, num2) {
  num1 = parseInt(num1);
  num2 = parseFloat(num2).toFixed(2);
  var result = parseFloat(num1 * num2).toFixed(2);
  return result;
}

function addItem(event) {
  event.preventDefault();
  event.currentTarget.classList.add("hidden");
  var row = document.createElement("tr");
  row.innerHTML = template;
  row.classList.add("table-row");
  row.setAttribute("id", "insert-template");
  tableBody.appendChild(row);
  var dataList = document.getElementById('data');
  dataList.innerHTML = data_value;
  $("#name").on('input', function () {
    var val = this.value;
    if ($('#data option').filter(function () {
      return this.value === val;
    }).length) {
      //send ajax request

      var pro_name = this.value;
      $.each(pro_data.list, function (i, data) {
        if (data.product == pro_name) {
          $("#price").val(data.unit_price);

        }
      });

    }
  });
  document.getElementById("save").addEventListener("click", saveItem);
}

function getLastRowIndex() {
  var element = document.querySelector('.table tbody tr:last-of-type');
  if (!element) return 0;
  return parseInt(element.textContent);
}

function validateFields() {
  var field = document.querySelector('.table input:invalid');
  if (field) {
    var fieldName = field.getAttribute('name');
    snackbar.textContent = "Please enter " + fieldName;
    snackbar.classList.add('show');
    setTimeout(function () {
      return snackbar.classList.remove('show');
    }, 2000);
    return false;
  }
  return true;
}

function saveItem(event) {
  event.preventDefault();
  if (!validateFields()) return;
  addButton.classList.remove("hidden");
  var name = document.getElementById("name").value;
  var quantity = document.getElementById("quantity").value;
  var price = document.getElementById("price").value;
  var total = multiply(quantity, price);
  tableBody.deleteRow(-1);
  var index = getLastRowIndex();
  var addTemplate = "\n    <td class=\"index\">" + (index + 1) + "</td>\n    <td class=\"name\">" + name + "</td>\n    <td class=\"quantity\">" + quantity + "</td>\n    <td class=\"price\">" + price + "</td>\n    <td class=\"total\">" + total + "</td>\n    <td class=\"action\">\n      <button class=\"danger\" title=\"Delete Product\">\n      <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\">\n  <path d=\"M22,3H7C6.31,3 5.77,3.35 5.41,3.88L0,12L5.41,20.11C5.77,20.64 6.31,21 7,21H22A2,2 0 0,0 24,19V5A2,2 0 0,0 22,3M19,15.59L17.59,17L14,13.41L10.41,17L9,15.59L12.59,12L9,8.41L10.41,7L14,10.59L17.59,7L19,8.41L15.41,12\"></path>\n</svg>\n    </button>\n    </td>\n  ";
  var row = tableBody.insertRow(-1);
  row.classList.add("table-row");
  row.setAttribute('data-index', index);
  row.innerHTML = addTemplate;
  row.getElementsByClassName('danger')[0].addEventListener('click', deleteRow);
  updateGrandTotal();
}

function updateGrandTotal(number) {
  var grandTotalNode = document.getElementById('grand-total');
  var totalNodes = Array.from(document.getElementsByClassName('total'));
  var sum = totalNodes.reduce(function (acc, current) {
    return parseFloat(acc) + parseFloat(current.textContent);
  }, 0);
  grandTotalNode.textContent = sum;
}

function deleteRow(event) {
  event.preventDefault();
  var deleteElement = event.currentTarget;
  var rowIndex = deleteElement.closest('tr').getAttribute('data-index');
  tableBody.deleteRow(rowIndex);
  updateGrandTotal();
  updateIndices();
}

function updateIndices() {
  var tableRows = document.querySelectorAll('.table-row .index');
  if (tableRows) tableRows.forEach(function (item, index) {
    item.textContent = index + 1;
    item.parentElement.setAttribute('data-index', index);
  });
}

function getData() {
  const button = document.getElementById('print');
  button.setAttribute('disabled', true);
  var name = document.getElementById('cust-name').value;
  var date = document.getElementById('date').value;
  var grandTotal = document.getElementById('grand-total').textContent;
  var tableRows = document.getElementsByClassName('table-row');
  var count_product = tableRows.length;
  var data = {
    name: name,
    date: date,
    products: [],
    grandTotal: grandTotal,
    count: count_product
  };
  var products = data.products;
  for (var i = 0; i < tableRows.length; i++) {
    products.push({
      name: tableRows[i].getElementsByClassName('name')[0].textContent,
      quantity: tableRows[i].getElementsByClassName('quantity')[0].textContent,
      price: tableRows[i].getElementsByClassName('price')[0].textContent,
      total: tableRows[i].getElementsByClassName('total')[0].textContent
    });
  }
  var json_data = data;
  $.ajax({
    url: 'https://script.google.com/macros/s/AKfycbz2fQ9p5EF7uJiZhuSg3G_UC_rYjr9tw34k0Miu9PmwIYXniTc/exec',
    type: 'post',
    dataType: 'json',
    complete: function(data) {
      button.disabled = false;
      alert("complete");
    },
    data: json_data
  });


}

(function () {
  flatpickr("#date", {});
  document.getElementById('print').addEventListener('click', getData);
})();