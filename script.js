const video = document.getElementById("video");

const startBtn = document.getElementById("startBtn");
const sessionBtn = document.getElementById("sessionBtn");
const motivateBtn = document.getElementById("motivateBtn");

const status = document.getElementById("status");
const score = document.getElementById("score");

const quote = document.getElementById("quote");
const suggestion = document.getElementById("suggestion");

const timerDisplay = document.getElementById("timer");


// ---------------- VARIABLES ----------------


let cameraStarted = false;

let focusScore = 0;

let blinkCount = 0;

let lastBlinkTime = 0;


// Session

let sessionRunning = false;

let seconds = 0;

let timer = null;

let focusHistory = [];




// ---------------- MOTIVATION ----------------


motivateBtn.onclick = function(){


    let random = Math.floor(Math.random()*quotes.length);


    quote.innerHTML = quotes[random].quote;


    suggestion.innerHTML = quotes[random].suggestion;


};






// ---------------- CAMERA ----------------


startBtn.onclick = async function(){


    if(cameraStarted)
        return;


    try{


        let stream = await navigator.mediaDevices.getUserMedia({

            video:true,

            audio:false

        });



        video.srcObject = stream;


        cameraStarted = true;


        status.innerHTML = "AI ANALYZING...";


        startAI();


    }


    catch(error){


        alert("Camera permission required");


        console.log(error);


    }


};








// ---------------- AI ENGINE ----------------


function startAI(){



let blinkCounter = 0;



const faceMesh = new FaceMesh({


locateFile:(file)=>{


return "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/"+file;


}


});





faceMesh.setOptions({


maxNumFaces:1,

refineLandmarks:true,

minDetectionConfidence:0.5,

minTrackingConfidence:0.5


});







faceMesh.onResults(function(results){



// No face


if(results.multiFaceLandmarks.length===0){


focusScore=0;


status.innerHTML="NO FACE DETECTED";


updateScore();


return;


}





let face = results.multiFaceLandmarks[0];




// Eye calculation


let eyeDistance = Math.abs(

face[159].y - face[145].y

);



let eyesOpen = true;



if(eyeDistance < 0.015){


eyesOpen=false;



let now = Date.now();



if(now-lastBlinkTime > 500){


blinkCounter++;


lastBlinkTime=now;


}


}






// Looking direction


let nosePosition = face[1].x;


let lookingForward = true;



if(nosePosition < 0.35 || nosePosition > 0.65){


lookingForward=false;


}







// Focus calculation


let result = 40; 


// Face detected


if(eyesOpen){

result +=30;

}



if(lookingForward){

result +=20;

}



if(blinkCounter < 20){

result +=10;

}



focusScore = result;



if(focusScore > 100)

focusScore = 100;





// Status


if(focusScore >=80){


status.innerHTML="FOCUSED";


suggestion.innerHTML=
"Excellent concentration. Keep going!";


}


else if(focusScore >=50){


status.innerHTML="DISTRACTED";


suggestion.innerHTML=
"Bring your attention back.";


}


else{


status.innerHTML="TIRED";


suggestion.innerHTML=
"Take a short break.";


}



updateScore();



});








const camera = new Camera(video,{


onFrame:async()=>{


await faceMesh.send({

image:video

});


},


width:640,

height:480


});



camera.start();



}







function updateScore(){


score.innerHTML =

"Focus Score : "

+Math.round(focusScore)+"%";


}









// ---------------- SESSION TIMER ----------------



sessionBtn.onclick=function(){



if(!sessionRunning){



sessionRunning=true;


seconds=0;


focusHistory=[];


sessionBtn.innerHTML="End Session";



timer=setInterval(()=>{


seconds++;


updateTimer();



if(seconds%10===0){


focusHistory.push(focusScore);


}



},1000);



}



else{


sessionRunning=false;


clearInterval(timer);


sessionBtn.innerHTML="Start Session";


showReport();


}



};








function updateTimer(){


let min=Math.floor(seconds/60);


let sec=seconds%60;



timerDisplay.innerHTML=

"Session Time : "

+String(min).padStart(2,"0")

+":"

+String(sec).padStart(2,"0");


}








// ---------------- REPORT ----------------



function showReport(){



let total=0;



focusHistory.forEach(value=>{


total+=value;


});



let average=focusScore;



if(focusHistory.length>0){


average=Math.round(total/focusHistory.length);


}



alert(

"FocusNest AI Report\n\n"+

"Session Duration : "

+timerDisplay.innerHTML+

"\n\nAverage Focus : "

+average+"%"

);



}