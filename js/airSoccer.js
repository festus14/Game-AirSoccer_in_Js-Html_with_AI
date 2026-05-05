//Create the start screen image of the game
let cnv_startBackground = document.getElementById('startBackground');
let ctx_startBackground = cnv_startBackground.getContext('2d');
ctx_startBackground.imageSmoothingEnabled = false;

let img_startBackground = new Image();
img_startBackground.src = "./assets/airSoccer_menuBackground.png";

img_startBackground.onload = function () {
    ctx_startBackground.drawImage(img_startBackground, 0, 0, cnv_startBackground.width, cnv_startBackground.height);
};

//Start button which on click will start the game, it contains all the functions
var startButton = document.getElementById("startButton");
startButton.addEventListener("click", function() {
    game();
});



function game(){
    //hide the start button
    startButton.style.display = "none";


    // Use the HTML canvas for the playing field background in an almost white color
    let cnv = document.getElementById('background');
    let width_cnv_background = cnv.width;  //we will reuse most canvases for some calculations with other canvases
    let height_cnv_background = cnv.height;

    let ctx_background = cnv.getContext('2d');
    ctx_background.imageSmoothingEnabled = false;

    let img_background = new Image();
    img_background.src = "./assets/soccer_field.png";

    img_background.onload = function () {
        ctx_background.drawImage(img_background, 0, 0, cnv.width, cnv.height);
    };

    //Get the canvas for the tutorial
    let cnv_tutorial = document.getElementById('tutorial');
    let ctx_tutorial = cnv_tutorial.getContext('2d');
    //Create the text with the font and the color
    ctx_tutorial.font = '20px Arial';
    ctx_tutorial.fillStyle = 'red';
    ctx_tutorial.fillText('Tutorial: (/!| IF THE PROGRAM BUGS at startup RESTART IT /!|) ', 10, 30);

    //This text is too long, we need to split it to display it
    ctx_tutorial.fillStyle = 'green';
    let text = "This project is a soccer game (a kind of air hockey). You control the red player\nwith your mouse, and by moving the cursor, you can shoot the ball more or less\nstrongly. The goal is obviously to get the best score against the computer.";
    var x_line = 30; // x position of the tutorial lines
    var y_line = 50; // y position of the tutorial lines
    var line_height = 20; //Line spacing
    var line_text = text.split('\n'); // Split the text into a list at each line break

    //Display the text with line breaks
    for (var i = 0; i<line_text.length; i++){
        ctx_tutorial.fillText(line_text[i], x_line, y_line + (i*line_height));
    }


    //Get the player paddle canvas to load the image
    let cnv_playerPaddle = document.getElementById('playerPaddle');
    let ctx_playerPaddle = cnv_playerPaddle.getContext('2d');

    let img_playerPaddle = new Image();
    img_playerPaddle.src = "./assets/paddle_red.png";

    img_playerPaddle.onload = function () {
        ctx_playerPaddle.drawImage(img_playerPaddle, 0, 0, cnv.width, cnv.height/2);
    };

    // We use the canvas for the opponent's paddle
    let cnv_opponentPaddle = document.getElementById('opponentPaddle');
    let ctx_opponentPaddle = cnv_opponentPaddle.getContext('2d');

    let img_opponentPaddle = new Image();
    img_opponentPaddle.src = "./assets/paddle_blue.png";

    img_opponentPaddle.onload = function () {
        ctx_opponentPaddle.drawImage(img_opponentPaddle, 0, 0, cnv.width, cnv.height/2);
    };

    let posXOpponentPaddle = 3* (width_cnv_background /4); //XY of the opponent
    let posYOpponentPaddle = height_cnv_background /2 ;


    //For the paddle, that is to say the player
    let paddleRadius = 40; //radius of the circle representing the player
    let opponentPaddleRadius = 40;  //radius of the circle representing the opponent


    //We use the ball canvas to load the image
    let cnv_ball = document.getElementById('ball');
    let ctx_ball = cnv_ball.getContext('2d');

    let img_ball = new Image();
    img_ball.src = "./assets/ball.png";

    img_ball.onload = function () {
        ctx_ball.drawImage(img_ball, 0, 0, cnv.width, cnv.height/2);
    };


    //We use the goal canvas
    let cnv_goal = document.getElementById('goal');
    let ctx_goal = cnv_goal.getContext('2d');

    //Initialization of the ball's characteristics
    let ball_radius = 30;
    let posX_Ball = cnv.width / 2;
    let posY_Ball = cnv.height / 2;

    let ballSpeedX = 0;
    let ballSpeedY = 0;

    let new_speed = 0;

    //For the player's mouse movement
    let mouse_x_player;
    let mouse_y_player;

    //Variable used to manage time to slow down the ball over time
    let time_Previous = 0;
    let time_Current = 0;
    let new_time = 0;

    //Game score, we initialize and display it
    let cnv_score = document.getElementById('score');
    let ctx_score = cnv_score.getContext('2d');
    ctx_score.font = '34px Arial';
    ctx_score.fillStyle = 'black';

    let line_size = 34 ; //in other words font size + 5
    let playerScore = 0;
    let opponentScore = 0;

    //display the score at the start

    ctx_score.clearRect(0, 0, cnv_score.width, cnv_score.height);
    ctx_score.fillText(`Score`, (width_cnv_background / 2)-line_size-10 , line_size);
    ctx_score.fillText(`${playerScore} : ${opponentScore}`, (width_cnv_background / 2)- line_size , line_size *2);

    //Function that updates the score when a goal is scored
    function update_score() {
        //Erase the old score
        ctx_score.clearRect(0, 0, cnv_score.width, cnv_score.height);
        //Display the new one
        ctx_score.fillText(`Score`, (width_cnv_background / 2)-line_size-10, line_size);
        ctx_score.fillText(`${playerScore} : ${opponentScore}`, (width_cnv_background / 2)- line_size , line_size *2);
    }

    //To get the mouse position on the X or Y axis
    addEventListener("mousemove", (e) => {
        //We shifted the top-left corner of the canvases to center the page, we will get its coordinates
        let canvas_corner = cnv.getBoundingClientRect();
        //Now in addition to getting XY of the mouse, we need to offset based on the top corner of the canvases
        mouse_x_player = e.clientX - canvas_corner.left;
        mouse_y_player = e.clientY - canvas_corner.top;

        //so that the player cannot go past their half of the field
        if (mouse_x_player > width_cnv_background / 2){
            mouse_x_player=width_cnv_background /2;
        }

        //Useful to find the mouse movement speed and make the ball move faster or slower
        time_Current = Date.now();
        new_time = time_Current - time_Previous;
        time_Previous = time_Current;
    });


    //Here we will work on a function that will be useful to slow down the ball over time
    let countdown_max = 100; // The countdown starts at 100
    let reduction_index = 1;

    function countdown_slowBall() {
        // console.log(countdown_max); //for debugging

        //When 4 seconds have elapsed we start to decrement the speed
        if (countdown_max > 0 && countdown_max < 60) {

            //this if helps debug and prevents it from decrementing when we touch the ball again
            //as long as the speed is above 1 we make it decrease
            if ((Math.abs(ballSpeedX) >  1)  || (Math.abs(ballSpeedY) > 1)){
                ballSpeedX = ballSpeedX / reduction_index;
                ballSpeedY = ballSpeedY / reduction_index;
                reduction_index += 0.001;
            }
            else{
                clearInterval(counter); // Stop the countdown once it reaches 0 and reset
                countdown_max = 100;
                ball_touched = false;
                counter=0;
                return ;
            }
            // console.log(ballSpeedX); //for debugging
            // console.log(ballSpeedY);
        }

        //in case the ball is so fast that after 10 seconds the ball is not slowed down
        else if (  countdown_max <=  0){
            clearInterval(counter); // Stop the countdown once it reaches 0
            countdown_max = 100;
            ball_touched = false;
            counter=0;
            return ; //reset of the countdown
        }


        countdown_max--; // Decrement the countdown by one second
    }

    //initialization of the variable that will receive the counter
    let counter = 0;// Update the countdown every second (1000 milliseconds)

    //Add a variable to indicate if the ball has been touched, will be used to recalibrate the speed countdown function
    //if we touch the ball multiple times
    let ball_touched = false;


    function move_collisionBall() {
        requestAnimationFrame(move_collisionBall);

        // Update the ball's position
        posX_Ball += ballSpeedX;
        posY_Ball += ballSpeedY;
        new_speed = (mouse_x_player / new_time) / 4;

        //Create a speed cap so that the ball cannot reach an insane speed
        //based on the power of the shot (that is, the cursor speed)
        if (new_speed > 20) {
            new_speed = 20;
        }

        //Handle collisions with the page edges
        if (posX_Ball - ball_radius < 0 || posX_Ball + ball_radius > cnv.width) {
            ballSpeedX = -ballSpeedX;
        }
        if (posY_Ball - ball_radius < 0 || posY_Ball + ball_radius > cnv.height) {
            ballSpeedY = -ballSpeedY;
        }

        //(in the exceptional case where the ball manages to cross the barrier)
        if (posX_Ball - ball_radius < -50 || posX_Ball + ball_radius > cnv.width +50) {
            ballSpeedX = -ballSpeedX;
            posX_Ball = cnv.width / 2;
            posY_Ball = cnv.height / 2;
        }

        if (posY_Ball - ball_radius < -50 || posY_Ball + ball_radius > cnv.height +50) {
            ballSpeedY = -ballSpeedY;
            posX_Ball = cnv.width / 2;
            posY_Ball = cnv.height / 2;
        }


        //For the distance between the ball and the paddle
        let paddleDistance = Math.sqrt(Math.pow(posX_Ball - mouse_x_player, 2) + Math.pow(posY_Ball - mouse_y_player, 2));

        // Handle collision with the mouse
        if (paddleDistance < ball_radius + paddleRadius) {
            ballSpeedX = (posX_Ball - mouse_x_player) * new_speed / paddleDistance;
            ballSpeedY = (posY_Ball - mouse_y_player) * new_speed / paddleDistance;

            // Calculate direction based on angle ranges
            //for this we need 8 sections
            let angleDeg = ((Math.atan2(mouse_y_player - posY_Ball, mouse_x_player - posX_Ball) * 180) / Math.PI);
            angleDeg = (angleDeg + 360) % 360;


            countdown_max = 100;  // we are about to reset the function that slows the ball


            // Handle direction with 45 degree intervals
            if ((angleDeg >= 337.5 || angleDeg < 22.5)) {
                // Go left
                ballSpeedX = -new_speed;
                ballSpeedY = 0;

            } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
                // Go top-left
                ballSpeedX = -new_speed;
                ballSpeedY = -new_speed;

            } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
                // Go up
                ballSpeedX = 0;
                ballSpeedY = -new_speed;

            } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
                // Go top-right
                ballSpeedX = new_speed;
                ballSpeedY = -new_speed;

            } else if (angleDeg >= 157.5 && angleDeg < 202.5) {
                // Go right
                ballSpeedX = new_speed;
                ballSpeedY = 0;

            } else if (angleDeg >= 202.5 && angleDeg < 247.5) {
                // Go bottom-right
                ballSpeedX = new_speed;
                ballSpeedY = new_speed;

            } else if (angleDeg >= 247.5 && angleDeg < 292.5) {
                // Go down
                ballSpeedX = 0;
                ballSpeedY = new_speed;

            } else if (angleDeg >= 292.5 && angleDeg < 337.5) {
                // Go bottom-left
                ballSpeedX = -new_speed;
                ballSpeedY = new_speed;

            }

            if (!ball_touched) {
                ball_touched = true; // Mark the ball as touched
                clearInterval(counter);
                counter = setInterval(countdown_slowBall, 100);
            }
        }

        else{
            // Reset if the ball is not touched
            ball_touched = false;
        }


        //If a goal is scored against the player's side, we replace the ball
        //since the goals are placed from one quarter of the edge to the third quarter, just put this in the conditions
        if (posX_Ball - ball_radius < 0 && ( ( posY_Ball > (height_cnv_background /4) ) && (posY_Ball < 3 * (height_cnv_background /4)) )  ) {
            ballSpeedX = 0;
            ballSpeedY = 0;
            posX_Ball = width_cnv_background / 4;

            //We increase the opponent's score
            opponentScore++;
            update_score();
        }

        //if the player manages to score on the opponent's side
        else if (posX_Ball + ball_radius >= width_cnv_background && ( ( posY_Ball > (height_cnv_background /4) ) && (posY_Ball < 3 * (height_cnv_background /4)) )  ) {
            ballSpeedX = 0;
            ballSpeedY = 0;
            posX_Ball = 3* (width_cnv_background / 4);

            //We increase the player's score
            playerScore++;
            update_score();
        }


        //Create the ball (here we draw a blue circle and place its image at the same location)
        // Clear the canvas
        ctx_ball.clearRect(0, 0, cnv.width, cnv.height);
        // Here we draw the ball
        ctx_ball.fillStyle = 'blue';
        ctx_ball.beginPath();
        ctx_ball.arc(posX_Ball, posY_Ball, ball_radius, 0, Math.PI * 2);
        ctx_ball.fill();
        ctx_ball.drawImage(img_ball, posX_Ball - ball_radius, posY_Ball - ball_radius, ball_radius * 2 , ball_radius * 2);

        //draw the player's paddle (here for safety we draw the red circle then overlay the image)
        ctx_playerPaddle.clearRect(0, 0, cnv_playerPaddle.width, cnv_playerPaddle.height);
        ctx_playerPaddle.fillStyle = 'red';
        ctx_playerPaddle.beginPath();
        ctx_playerPaddle.arc(mouse_x_player, mouse_y_player, paddleRadius, 0, Math.PI * 2);
        ctx_playerPaddle.fill();
        ctx_playerPaddle.drawImage(img_playerPaddle, mouse_x_player - paddleRadius, mouse_y_player - paddleRadius, paddleRadius * 2, paddleRadius * 2);

        // Draw Player Goal
        ctx_goal.fillStyle = 'red';
        ctx_goal.fillRect(0, (height_cnv_background /4), 10 , (height_cnv_background / 2)  );

        // Draw Opponent Goal
        ctx_goal.fillStyle = 'blue';
        ctx_goal.fillRect(width_cnv_background-10, (height_cnv_background /4), 10 , (height_cnv_background / 2)  );

    }

    move_collisionBall();



    function auto_movement_opponentPaddle() {
        requestAnimationFrame(auto_movement_opponentPaddle);

        // Calculate the opponent's direction to follow the ball
        let directionX = posX_Ball - posXOpponentPaddle;
        let directionY = posY_Ball - posYOpponentPaddle;
        let dist_paddle_opp = Math.sqrt(directionX * directionX + directionY * directionY);

        //Movement speed of the opponent
        let opponentPaddleSpeed = 4;

        if (dist_paddle_opp > 0) {
            directionX /= dist_paddle_opp;
            directionY /= dist_paddle_opp;
        }

        // Check if the ball is overlapping the computer
        let distanceBallComputer = Math.sqrt(Math.pow(posX_Ball - posXOpponentPaddle, 2) + Math.pow(posY_Ball - posYOpponentPaddle, 2));
        let minimumDistance = ball_radius + opponentPaddleRadius;

        if (distanceBallComputer > minimumDistance) {
            // Update the position of the computer's paddle
            posXOpponentPaddle += directionX * opponentPaddleSpeed;
            posYOpponentPaddle += directionY * opponentPaddleSpeed;

            // Limit the paddle's position to the right side of the field
            posXOpponentPaddle = Math.max(width_cnv_background / 2, posXOpponentPaddle);
            posXOpponentPaddle = Math.min(width_cnv_background, posXOpponentPaddle);
            posYOpponentPaddle = Math.max(0, posYOpponentPaddle);
            posYOpponentPaddle = Math.min(height_cnv_background, posYOpponentPaddle);
        }


        // Handle collision
        if (dist_paddle_opp < ball_radius + opponentPaddleRadius) {
            ballSpeedX = (posX_Ball - posXOpponentPaddle) * new_speed / dist_paddle_opp;
            ballSpeedY = (posY_Ball - posYOpponentPaddle) * new_speed / dist_paddle_opp;

            // Calculate direction based on angles
            //for this we need 8 angles
            let angleDeg_ball_opp = ((Math.atan2(posXOpponentPaddle - posX_Ball, posYOpponentPaddle - posY_Ball) * 180) / Math.PI);
            angleDeg_ball_opp = (angleDeg_ball_opp + 360) % 360;


            countdown_max = 100;


            // Handle direction with 45 degree intervals
            if ((angleDeg_ball_opp >= 337.5 || angleDeg_ball_opp < 22.5)) {
                // Go left
                ballSpeedX = -new_speed;
                ballSpeedY = 0;

            } else if (angleDeg_ball_opp >= 22.5 && angleDeg_ball_opp < 67.5) {
                // Go top-left
                ballSpeedX = -new_speed;
                ballSpeedY = -new_speed;

            } else if (angleDeg_ball_opp >= 67.5 && angleDeg_ball_opp < 112.5) {
                // Go up
                ballSpeedX = 0;
                ballSpeedY = -new_speed;

            } else if (angleDeg_ball_opp >= 112.5 && angleDeg_ball_opp < 157.5) {
                // Go top-right
                ballSpeedX = new_speed;
                ballSpeedY = -new_speed;

            } else if (angleDeg_ball_opp >= 157.5 && angleDeg_ball_opp < 202.5) {
                // Go right
                ballSpeedX = new_speed;
                ballSpeedY = 0;

            } else if (angleDeg_ball_opp >= 202.5 && angleDeg_ball_opp < 247.5) {
                // Go bottom-right
                ballSpeedX = new_speed;
                ballSpeedY = new_speed;

            } else if (angleDeg_ball_opp >= 247.5 && angleDeg_ball_opp < 292.5) {
                // Go down
                ballSpeedX = 0;
                ballSpeedY = new_speed;

            } else if (angleDeg_ball_opp >= 292.5 && angleDeg_ball_opp < 337.5) {
                // Go bottom-left
                ballSpeedX = -new_speed;
                ballSpeedY = new_speed;
            }

            if (!ball_touched) {
                ball_touched = true;
                clearInterval(counter);
                counter = setInterval(countdown_slowBall, 100);
            }
        }

        else{
            // Reset if the ball is not touched
            ball_touched = false;
        }

        // Display the opponent
        ctx_opponentPaddle.clearRect(0, 0, cnv_opponentPaddle.width, cnv_opponentPaddle.height);
        ctx_opponentPaddle.fillStyle = 'yellow';
        ctx_opponentPaddle.beginPath();
        ctx_opponentPaddle.arc(posXOpponentPaddle, posYOpponentPaddle, opponentPaddleRadius, 0, Math.PI * 2);
        ctx_opponentPaddle.fill();
        ctx_opponentPaddle.drawImage(img_opponentPaddle, posXOpponentPaddle - opponentPaddleRadius, posYOpponentPaddle - opponentPaddleRadius, opponentPaddleRadius * 2, opponentPaddleRadius * 2);

    }

    auto_movement_opponentPaddle();



}





//------------------------------
