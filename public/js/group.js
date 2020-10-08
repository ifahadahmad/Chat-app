var socket=io();
socket.on("group",message=>{
    var ul = document.querySelector(".group-list");
    var p = document.createElement("div");
    var c = document.createElement("span");
    var c1 = document.createElement("span");
    var c2 = document.createElement("span");
    p.className="list m-2";
    p.style="align-self: flex-start;";
    c.className="bg-light p-2;";
    c.style="display: flex;width:fit-content;flex-direction: column;";
    c1.innerText=message.from.username+":";
    c2.innerText=message.text;
    c.appendChild(c1);
    c.appendChild(c2);
    p.appendChild(c);
    ul.appendChild(p);
    toBottom();

});
socket.on("delete-message-group",message=>{
    var list = document.querySelectorAll(".list");
    var ul = document.querySelector(".group-list");
    for(var i=0;i<list.length;i++){
        if(list[i].firstElementChild.lastElementChild.childNodes[0].textContent.trim()===message){
            ul.removeChild(list[i]);
        }
    }
});
socket.on("user-connected",username=>{
    var el = document.createElement("div");
    var ul = document.querySelector(".group-list");
    el.innerText=username+" is Connected!!";
    ul.appendChild(el);
    toBottom();
    setTimeout(function(){
        el.remove();
    },10000);
});
socket.on("user-disconnected",username=>{
    var el = document.createElement("div");
    var ul = document.querySelector(".group-list");
    el.innerText=username+" is disconnected!!";
    ul.appendChild(el);
    toBottom();
    setTimeout(function(){
        el.remove();
    },10000);
});
function handleClick(url){
    var xhr = new XMLHttpRequest;
    xhr.open("POST",url,true);
    xhr.onreadystatechange=function(){
        if(xhr.status=="200"&&xhr.readyState==4){
        }
    }
    xhr.send();
}


function toBottom(){
    window.scrollTo(0, document.body.scrollHeight);
}
window.onload=toBottom;