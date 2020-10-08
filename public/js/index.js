var socket=io();
socket.on("notify",({message})=>{
    var list = document.querySelectorAll(".list");
    var notif = document.querySelector(".notif");
    for(var i=0;i<list.length;i++){
        if(list[i].firstElementChild.textContent===message.from.username&&list[i].lastElementChild.textContent===null){
            list[i].lastElementChild.textContent=1;

        } else if(list[i].firstElementChild.textContent===message.from.username){
            list[i].lastElementChild.textContent=Number(list[i].lastElementChild.textContent)+1;

        }
    }
});