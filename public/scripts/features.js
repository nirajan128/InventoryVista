 // Example Chart.js script
 const ctx = document.getElementById('inventoryChart').getContext('2d');
 const inventoryChart = new Chart(ctx, {
     type: 'bar',
     data: {
         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
         datasets: [{
             label: 'Items in Stock',
             data: [100, 200, 150, 300, 250, 200, 300],
             backgroundColor: 'rgba(54, 162, 235, 0.2)',
             borderColor: 'rgba(54, 162, 235, 1)',
             borderWidth: 1
         }]
     },
     options: {
         scales: {
             y: {
                 beginAtZero: true
             }
         }
     }
 });


 //sidebar
 document.querySelectorAll(".nav-link").forEach(link =>{
     link.addEventListener("click", function() {
        console.log("clicked")
        document.querySelectorAll(".nav-link").forEach(link =>{ link.classList.remove("active")});
        this.classList.add("active");
        const attribute = this.getAttribute("data-target")
        document.querySelectorAll(".content-section").forEach(section=>{
            if(section.id === attribute){
                section.classList.add("active")
            }else{
                section.classList.remove("active")
            }
        })
     })
 })