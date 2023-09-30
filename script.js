// document.addEventListener("DOMContentLoaded", function() {
//     // Attach event listener to checkboxes
//     const checkboxes = document.querySelectorAll("input[type='checkbox']");
    
//     checkboxes.forEach(checkbox => {
//       checkbox.addEventListener("change", function() {
//         const label = this.nextElementSibling;
//         if (this.checked) {
//           if (this.classList.contains("semi-checked")) {
//             label.classList.remove("not-checked", "checked");
//             label.classList.add("semi-checked");
//           } else {
//             label.classList.remove("not-checked", "semi-checked");
//             label.classList.add("checked");
//           }
//         } else {
//           label.classList.remove("checked", "semi-checked");
//           label.classList.add("not-checked");
//         }
//       });
//     });
//   });