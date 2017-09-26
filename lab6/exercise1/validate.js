/**
 * Created by ldu32 on 26/09/17.
 */
function validateForm() {
    let search_string = document.getElementById("search_string").value;

    if (search_string === "") {
        alert("Search string is empty!");
        return false;
    } else {
        return true;
    }
}