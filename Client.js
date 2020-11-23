var ws,output=$('.ChatRoom .Output');
var User=new Object(),Server=new Object();
if (!window.WebSocket){
    output.html('');
    Write(`Fucking Error: No Websocket support.\n`,{'color':"#e7483f"});
}
function Initalize(){
    ws=new WebSocket(`ws://${User.host}:${User.port}`);
    Commands.cls.fun();
    ws.onopen=()=>{
        ws.send(JSON.stringify({
            headers:{
                "Content_Type":'application/init',
                "Set_Name":User.name
            }
        }));
    }
    ws.onclose=(CS_E)=>{
        console.log(CS_E);
        $('.Status .Output').html(`<span style='color:#e7483f;'>Cannot find the service</span>`);
        Write(`[ERROR] Error Code : ${CS_E.code}\nCannot find the service.`,{'color':"#e7483f"});
    }
    ws.onmessage=(msg)=>{
        // console.log(msg);
        msg=JSON.parse(msg.data);
        if(msg.headers['Content_Type']==='application/init'){
            Server=msg.headers.Set_serverinfo;
            $('.Status .Output').html('Chat Room');
            $('.UserInfo .Output').html(`Chat Name : ${Server.name}\nUser : ${User.name}\nUser List : \n${Server.usrList.map(x=>'|---'+x).join('\n')}`);
            output.html('');
            Write(`[NOTE] Chat name : ${Server.name}\nUser(s) : ${Server.usrList.join(', ')}\n               JS Chat Room\n/cls      | to clear the messages.\n/exit     | to exit the chat room.\n`,{"color":"#13c60d"});
        }
        if(msg.headers['Content_Type']==='application/message'){
            if(msg.headers['Style']){
                Write(msg.body+'\n',msg.headers['Style']);
            }else Write(msg.body+'\n');
        }
        if(msg.headers['Content_Type']==='application/command'){
            RemoteCommands[msg.headers['Command']](msg.headers['Parameter']);
        }
    }
}
var RemoteCommands={
    "UsrAdd":(Para)=>{
        if(Server.usrList){
            Server.usrList.push(Para[0]);
            $('.UserInfo .Output').html(`Chat Name : ${Server.name}\nUser : ${User.name}\nUser List : \n${Server.usrList.map(x=>'|---'+x).join('\n')}`);
        }
    },
    "UsrDel":(Para)=>{
        if(Server.usrList){
            Server.usrList.splice(Server.usrList.indexOf(Para[0]),1);
            $('.UserInfo .Output').html(`Chat Name : ${Server.name}\nUser : ${User.name}\nUser List : \n${Server.usrList.map(x=>'|---'+x).join('\n')}`);
        }
    }
}
var Commands={
    "cls":{
        fun:()=>{output.empty();}
    },
    "exit":{
        fun:()=>{ws.close()}
    }
},S_Status=0,S_Interface=true;
function Send(msg){
    S_Interface=false;
    if(S_Status!==3){
        if(S_Status===0){
            User.host=msg;
            S_Status++;
            Write(`[NOTE] Get Host IP : ${User.host}\n`,{'color':'#13c60d'});
            Write(`Service Port : \n`);
        }else if(S_Status===1){
            User.port=parseInt(msg);
            S_Status++;
            Write(`[NOTE] Get Service Port : ${User.port}\n`,{'color':'#13c60d'});
            Write(`Your Name : \n`);
        }else if(S_Status===2){
            User.name=msg;
            S_Status++;
            Initalize();
        }
    }else if(msg[0]==='/'){
        Commands[msg.substr(1)].fun();
    }else {
        ws.send(JSON.stringify({
            headers:{
                Content_Type:'application/message'
            },
            body:msg
        }))
    }
}
window.onload=()=>{
    Write(`Host IP : \n|-- Public Room: 49.234.17.22:8080 <span style='color:grey;'>·Pending</span>\n`);
    let Ping=new WebSocket('ws://49.234.17.22:8080');
    Ping.onerror=()=>{
        if(S_Interface===true){
            output.empty();
            Write(`Host IP : \n|-- Public Room: 49.234.17.22:8080 <span style='color:#e7483f;'>·Offline</span>\n`);
        }
    };
    Ping.onopen=()=>{
        if(S_Interface===true){
            output.empty();
            Write(`Host IP : \n|-- Public Room: 49.234.17.22:8080 <span style='color:#13c60d;'>·Online</span>\n`);
            Ping.close();
        }
    }
}
function Write(msg,style){
    if(style){
        let StyleText=[];
        Object.keys(style).forEach(key=>{
            StyleText.push(`${key}:${style[key]}`);
        });
        StyleText=StyleText.join(';');
        output.html(`${output.html()}<span style='${StyleText}'>${msg}</span>`)
    }else {
        output.html(output.html()+msg);
    }
}