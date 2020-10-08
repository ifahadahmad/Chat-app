var socket=io();
    socket.on("message",message=>{
        var ul = document.querySelector(".mssg");
        var li = document.createElement("p");
        var span = document.createElement("span");
        span.innerText=message.text;
        span.className="bg-light p-2";
        span.style="border-radius: 10%;";
        li.className="text-left mb-3";
        li.appendChild(span);
        ul.appendChild(li);
        toBottom();
    });
    socket.on("delete-message",message=>{
        var list = document.querySelectorAll("p");
        var ul = document.querySelector(".mssg");
        for(var i=0;i<list.length;i++){
            if(list[i].textContent.trim()===message){
                ul.removeChild(list[i]);
            }
        }
    });
function handleClick(url){
    var xhr = new XMLHttpRequest;
    xhr.open("POST",url,true);
    xhr.onreadystatechange=function(){
        if(xhr.status=="200"&&xhr.readyState==4){
            console.log("message deleted");
        }
    }
    xhr.send();
}
// function handleSubmit(url,e) {
//     e.preventDefault();
//     var xhr = new XMLHttpRequest;
//     var myData = document.querySelector(".myData");
//     var data = new FormData();
//     data.append("message",myData.value);
//     xhr.open("POST",url,true);
//     xhr.onreadystatechange=function(){
//         if(xhr.status=="200"&&xhr.readyState==4){
//             console.log("message sent")
//         }
//     }
//     xhr.send(data);
// }
// var myForm = document.querySelector(".myForm");
// myForm.addEventListener("submit",function(e){
//     e.preventDefault();
//     var xhr = new XMLHttpRequest();
//         var myData = document.querySelector(".myData");
//         var data = new FormData();
//         data.append("message",myData.value);
//         xhr.open("POST",e.target.action,true);
//         xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
//         xhr.onreadystatechange=function(){
//             if(xhr.status=="200"&&xhr.readyState==4){
//                 console.log("message sent")
//             }
//         }
//         xhr.send(JSON.stringify(message:myData.value));
// });

function toBottom(){
    window.scrollTo(0, document.body.scrollHeight);
}
window.onload=toBottom;