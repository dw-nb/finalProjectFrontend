function autocomplete(type, array) {
  // this removes any pre-existing autocomplete items before appending new ones
  if (document.getElementById("autocompleteList")) {
    document.getElementById("autocompleteList").remove()
  }

  // this creates an unordered list, where we will put the items
  // only is called if array has 1 or more items
  let resultDiv
  if (array.length > 0) {
    resultDiv = document.createElement("ul");
    resultDiv.setAttribute("id", "autocompleteList");

    if (type === "fromInput") {
      document.getElementById("from").appendChild(resultDiv);
    } else {
      document.getElementById("to").appendChild(resultDiv);
    }

    // Cycle through all the items in teh array to create the full range of options
    // that the user can select from
    for (i in array) {
      let item = document.createElement('li')
      item.setAttribute("id", `autocompleteItem ${i}`);
      item.setAttribute("class", `item ${i}`);
      resultDiv.appendChild(item)
      item.appendChild(document.createTextNode(array[i]));
    }
  }
  // Replaces the input with the selected result
  // and updates the lat, long of the corresponding from/to point
  if (document.getElementById("autocompleteList")) {
    resultDiv.addEventListener("click", function(event) {
      // this gets the index of the address clicked on so we can use it to get the
      // lat and long and map it out
      let index = event.target.className.substr(5, 6)
      // Set innerHTML as what was selected
      document.getElementById(type).value = event.target.textContent
      // Close the autocomplete list
      document.getElementById("autocompleteList").remove()
      updateLocation(type, index)

      //findSuburb(osmId, index)
    })
  }
}
