var currentVersion = 0.1;

//  The Google WebFont Loader will look for this object, so create it before loading the script.
WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
        families: ['Anonymous+Pro']
    }

};



var States = {};

//*****************************************************************************************
//FONT LOAD STATE
//This is a 1 second state used to load the google webfont script
//It then loads the menu state
States.LoadFonts = function() {};
States.LoadFonts.prototype = {
    preload: function() {
        //load the font script
        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    },

    create: function() {
        game.stage.backgroundColor = '#363636';
        // place the assets and elements in their initial positions, create the state 
        game.time.events.add(Phaser.Timer.SECOND, loadMainMenu, this)

        function loadMainMenu() {


            game.state.start('Calculator');
 
        }
    },

    update: function() {

    }
};

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'gameDiv', States.LoadFonts);

// *****************************************************************************************
// Calculator State

States.Calculator = function() {};
States.Calculator.prototype = {
    preload: function() {},

    create: function() {
        game.calculatorSettings = {
            lastButtonPressed: {},
            displayedValue: [0],
            storedValue: null,
            chosenOperator: null
        };
        game.calculator = new Calculator();
    },

    update: function() {

    }
};

game.state.add('Calculator', States.Calculator);


function Calculator() {
    //the main group gets destroyed with resize
    this.group = game.add.group();
    //BACKDROP
    this.backDrop = new BackgroundSprite(game.width * .8, game.width / 2, 0xffffff)
    this.backDrop.x = game.camera.x + game.width / 2
    this.backDrop.y = game.camera.y + game.height / 2
    this.backDrop.anchor.setTo(0.5, 0.5);
    this.group.add(this.backDrop)
    this.hBorder = this.backDrop.width * .05
    this.vBorder = this.backDrop.height * .05
        //DISPLAY PANEL

    //draw the panel
    this.displayPanel = new BackgroundSprite(this.backDrop.width - 5, this.backDrop.height * .15, 0xffffff)
    this.displayPanel.x = this.backDrop.left
    this.displayPanel.y = this.backDrop.top
    this.group.add(this.displayPanel)
        //display  game.calculatorSettings.displayedValue
    this.style = {
        font: 'bold Anonymous Pro',
        fill: '#FFFFFF',
        align: 'right',
        fontSize: 10 
    };
    this.displayStyle = {
        font: 'bold Anonymous Pro',
        fill: '#000000',
        align: 'center',
        fontSize: 10
    };

    this.displayPanelValue = game.add.text(this.displayPanel.right - 5, this.displayPanel.y, 'XXXXXXXXXXXXXXXXXXXX', this.displayStyle)
    //this.displayPanelValue.setShadow(-5, 0, 'rgba(0,0,0,0.5)', 5);
    game.calculatorSettings.displayPanelValue = this.displayPanelValue
    this.displayPanelValue.anchor.setTo(1, 0.45)
    //this.displayPanelValue.padding.set(0, 0);
    this.displayPanelValue.centerY = this.displayPanel.centerY
    while (this.displayPanelValue.width < this.displayPanel.width * 0.95 && this.displayPanelValue.height < this.displayPanel.height) {
        this.displayPanelValue.fontSize++
    }

    this.setPanel = function(newValue) {
        if (newValue == null) {
            newValue = [0]
        }
        game.calculatorSettings.displayedValue = newValue;
        game.calculatorSettings.displayPanelValue.setText(game.calculatorSettings.displayedValue.join(''))
    }


    this.setPanel(game.calculatorSettings.displayedValue)
    this.group.add(this.displayPanelValue)


    var buttonHeight = (this.backDrop.bottom - this.displayPanel.bottom) / 2;
    var buttonWidth = (this.backDrop.width - 10) * .25;
    //NUMBER ENTRY BUTTONS 0/1
    //2x
    this.numberButtons = [null, null];
    for (var i = 0; i <= 1; i++) {
        //draw the panel
        this.numberButtons[i] = new BackgroundSprite(buttonWidth, buttonHeight, 0x4a4a4a)
        this.numberButtons[i].x = this.backDrop.left
        this.numberButtons[i].y = this.displayPanel.bottom - 5;
        if (i == 1) {
            this.numberButtons[i].y += buttonHeight
        }
        this.numberButtons[i].inputEnabled = true;
        this.numberButtons[i].input.useHandCursor = true;
        this.numberButtons[i].events.onInputDown.add(numberButtonClick)
        this.numberButtons[i].value = i;
        var label = game.add.text(buttonWidth / 2, buttonHeight / 2, i.toString(), this.style)
        this.numberButtons[i].addChild(label)
        label.anchor.setTo(0.5, 0.5)
        while (label.width < buttonWidth * .2) {
            label.fontSize++
        }
        this.group.add(this.numberButtons[i])
    }
    //input callback
    function numberButtonClick(button) {
        if (game.calculatorSettings.displayedValue.length < 20) {
            if (game.calculatorSettings.lastButtonPressed.type == 'equal') {
                game.calculator.setPanel([0])
            }
            //set game.calculator.lastButtonPressed to me (for CL/CE button)
            game.calculatorSettings.lastButtonPressed = button;
            //push the value onto the game.calculator.displayValue
            var newValue = game.calculatorSettings.displayedValue;

            //must either be a 1 or the display value should have a 1 somehwere
            if (button.value == 1 || game.calculatorSettings.displayedValue.indexOf(1) > -1) {
                //replace the first 0, or push it onto the stack
                if (game.calculatorSettings.displayedValue == 0) {
                    newValue = [1]
                }
                else {
                    newValue.push(button.value)
                }

                //update the displayPanel text 
                game.calculator.setPanel(newValue)
            }

        }

    }

    //OPERATORS
    //+-*/
    var operators = ['+', '-', '*', '/'];
    this.operatorButtons = []
    var operatorButtonLocs = [{
        x: this.numberButtons[0].right - 5,
        y: this.numberButtons[0].y
    }, {
        x: this.numberButtons[1].right - 5,
        y: this.numberButtons[1].y
    }, {
        x: this.numberButtons[0].right + buttonWidth - 5,
        y: this.numberButtons[0].y
    }, {
        x: this.numberButtons[1].right + buttonWidth - 5,
        y: this.numberButtons[1].y
    }];
    for (var i = 0; i < 4; i++) {
        //draw the panel
        //draw the button
        this.operatorButtons[i] = new BackgroundSprite(this.backDrop.width * .25, buttonHeight, 0x757575);
        this.operatorButtons[i].x = operatorButtonLocs[i].x
        this.operatorButtons[i].y = operatorButtonLocs[i].y
        this.operatorButtons[i].inputEnabled = true;
        this.operatorButtons[i].input.useHandCursor = true;
        this.operatorButtons[i].events.onInputDown.add(operatorButtonClick)
        this.operatorButtons[i].operator = operators[i];
        var label = game.add.text(buttonWidth / 2, buttonHeight / 2, operators[i].toString(), this.style)
        this.operatorButtons[i].addChild(label)
        label.anchor.setTo(0.5, 0.5)
        while (label.width < buttonWidth * .2) {
            label.fontSize++
        }
        this.group.add(this.operatorButtons[i])
    }

    //add the input callback
    function operatorButtonClick(button) {
        game.calculatorSettings.lastButtonPressed = button;
        //set game.calculatorSettings.chosenOperator to +-*/
        game.calculatorSettings.chosenOperator = button.operator
            //if there's a game.calculatorSettings.storedValue

        //set game.calculatorSettings.storedValue to game.calculatorSettings.displayedValue
        game.calculatorSettings.storedValue = game.calculatorSettings.displayedValue;
        //get rid of the remainder part if there is one
        var remainderIndex = game.calculatorSettings.storedValue.indexOf("R")
        if (remainderIndex > -1) {
            game.calculatorSettings.storedValue.splice(remainderIndex, game.calculatorSettings.storedValue.length - remainderIndex)
        }

        //clear the display and game.calculatorSettings.displayedValue
        game.calculator.setPanel([0])
    }


    //CL BUTTON
    //draw the panel
    //draw the button
    this.clearButton = new BackgroundSprite(this.backDrop.width * .25, buttonHeight, 0x757575);
    this.clearButton.x = this.operatorButtons[2].right - 5
    this.clearButton.y = operatorButtonLocs[2].y
        //add the input callback
    this.clearButton.inputEnabled = true;
    this.clearButton.input.useHandCursor = true;
    this.clearButton.events.onInputDown.add(clearButtonClick)
    this.clearButton.operator = operators[i];
    var label = game.add.text(buttonWidth / 2, buttonHeight / 2, 'CL', this.style)
    this.clearButton.addChild(label)
    label.anchor.setTo(0.5, 0.35)
    while (label.width < buttonWidth * .5) {
        label.fontSize++
    }
    this.group.add(this.clearButton)

    //input callback
    function clearButtonClick(button) {
        //check to see if this is a consecutive press with game.calculator.lastButtonPressed
        //clear the game.calculatorSettings.storedValue
        if (game.calculatorSettings.lastButtonPressed == button) {
            game.calculatorSettings.storedValue = null
        }

        game.calculatorSettings.lastButtonPressed = button;
        game.calculator.setPanel([0])
    }



    //EQUAL
    //draw the panel
    //draw the button
    this.equalButton = new BackgroundSprite(this.backDrop.width * .25, buttonHeight, 0x349980);
    this.equalButton.x = this.operatorButtons[2].right - 5
    this.equalButton.y = operatorButtonLocs[3].y
        //add the input callback
    this.equalButton.inputEnabled = true;
    this.equalButton.input.useHandCursor = true;
    this.equalButton.events.onInputDown.add(executeEqual)
    var label = game.add.text(buttonWidth / 2, buttonHeight / 2, '=', this.style)
    this.equalButton.addChild(label)
    label.anchor.setTo(0.5, 0.5)
    while (label.width < buttonWidth * .2) {
        label.fontSize++
    }
    this.group.add(this.equalButton)


    function executeEqual(button) {
        if (typeof button === 'undefined') {
            button = {};
        }

        button.type = 'equal';

        if (game.calculatorSettings.lastButtonPressed == button) {

        }
        else {
            game.calculatorSettings.bottomValue = game.calculatorSettings.displayedValue;
        }


        game.calculatorSettings.lastButtonPressed = button;
        //case statement to run selected operation on game.calculatorSettings.storedValue/bottomValue
        var answer = []

        var operationFunction = function() {};

        switch (game.calculatorSettings.chosenOperator) {
            case '+':
                //addition
                operationFunction = addBinaries
                break;
            case '-':
                //"subtraction"
                operationFunction = subtractBinaries
                break;
            case '*':
                //"multiplication"
                operationFunction = multiplyBinaries
                break;
            case '/':
                //"division"
                operationFunction = divideBinaries
                break;
            default:
                game.calculator.setPanel([0]);
        }
        //set displayedValue to answer
        answer = operationFunction(game.calculatorSettings.storedValue, game.calculatorSettings.bottomValue)
        console.log(binaryToDecimal(game.calculatorSettings.storedValue) + game.calculatorSettings.chosenOperator == null ? '/' : game.calculatorSettings.chosenOperator + binaryToDecimal(game.calculatorSettings.bottomValue) + '=' + binaryToDecimal(answer))
        game.calculator.setPanel(answer)


        //set storedValue to answer
        var remainderIndex = answer.indexOf("R")
        if (remainderIndex > -1) {
            answer.splice(remainderIndex, answer.length - remainderIndex)
        }
        game.calculatorSettings.storedValue = answer;
    }
}

//*****************************************************************************************
//Blank State
//This state adds the global functions
//It then loads the menu state
// States.Calculator = function() {};
// States.Calculator.prototype = {
//     preload: function() {},

//     create: function() {},

//     update: function() {

//     }
// };
// game.state.add('Calculator', States.Calculator);

// var answer = subtractBinaries(decimalToBinary(5), decimalToBinary(6))
// //console.log(answer)
function BackgroundSprite(width, height, color) {
    var backgroundGraphic = game.add.graphics(game.camera.x, game.camera.y);
    backgroundGraphic.lineStyle(5, 0xb8a9a9, 1);
    backgroundGraphic.beginFill(color, 1);
    backgroundGraphic.drawRect(0, 0, width, height);
    var returnSprite = game.add.sprite(0, 0, backgroundGraphic.generateTexture())
    backgroundGraphic.destroy()
    return returnSprite;
}

function divideBinaries(dividend, divisor) {
    console.log("dividend: ", binaryToDecimal(dividend))
    console.log("divisor: ", binaryToDecimal(divisor))
    var quotient = [0];
    while (subtractBinaries(dividend, divisor) != null) {
        tickBinary(quotient)
        dividend = subtractBinaries(dividend, divisor);
    }

    var object = {
        quotient: quotient,
        remainder: dividend
    }

    //remove leading 0's up to the first one
    for (var i = object.remainder.length - 1; i > -1; i--) {
        if (object.remainder[i] > 1) {
            object.remainder[i] -= 2
            if (i > 0) {
                object.remainder[i - 1]++
            }
            else {
                object.remainder.push(1)
            }
        }
    }
    while (-1 < object.remainder.indexOf(0) && object.remainder.indexOf(0) < object.remainder.indexOf(1)) {
        object.remainder.splice(object.remainder.indexOf(0), 1)
    }

    console.log("QUOTIENT: ", binaryToDecimal(object.quotient))
    console.log("REMAINDER: ", binaryToDecimal(object.remainder))
        //if we're only zeroes, blank it out
    if (object.remainder.indexOf(1) == -1) {
        object.remainder = [];
    }
    else //add an "R"
    {
        object.remainder.unshift("R");
    }
    //game.calculatorSettings.storedValue=null;
    //game.calculatorSettings.bottomValue=null;
    //game.calculatorSettings.lastButtonPressed = {}
    //game.calculatorSettings.storedValue = object.quotient
    //game.calculatorSettings.chosenOperator = null;
    var returnArray = object.quotient.concat(object.remainder)

    return returnArray
}

function multiplyBinaries(factor1, factor2) {
    //console.log(binaryToDecimal(factor1))
    //console.log(binaryToDecimal(factor2))
    var factor1Copy
    var factor2Copy
    if(factor1.length < factor2.length)
    {
        factor1Copy = factor1.slice(0, factor1.length);
        factor2Copy = factor2.slice(0, factor2.length); 
    } else
    {
        factor1Copy = factor2.slice(0, factor2.length);
        factor2Copy = factor1.slice(0, factor1.length); 
    }

    var answer = [0];
    var cycleLimit = 200000;
    while (factor1Copy.indexOf(1) > -1 && cycleLimit > 0) {
        cycleLimit--
        factor1Copy = subtractBinaries(factor1Copy, [1]);
        //console.log(answer, factor2)
        answer = addBinaries(answer, factor2Copy)
            //console.log(binaryToDecimal(answer))
    }

    if (cycleLimit == 0) {
        answer = [0];
    }

    return answer;
}

function subtractBinaries(minuend, subtrahend) {
    var difference = [];
    var negative = false;
    //even the number of digits
    if (minuend != null && subtrahend != null) {
        while (minuend.length > subtrahend.length) {
            subtrahend.unshift(0)
        }
    }



    for (var digit = minuend.length - 1; digit > -1; digit--) {
        if (minuend[digit] < subtrahend[digit]) {
            //regroup
            ////console.log("regrouping before: " , minuend)
            var regrouped = false;
            for (var regroupDigit = digit; regroupDigit > -1; regroupDigit--) {
                if (!regrouped && minuend[regroupDigit] == 1) {
                    regrouped = true
                    minuend[regroupDigit] = 0;
                    for (var distributeDigit = regroupDigit + 1; distributeDigit <= digit; distributeDigit++) {
                        minuend[distributeDigit]++
                            if (distributeDigit == digit) {
                                minuend[distributeDigit]++
                            }
                    }
                }
            }
            ////console.log("regrouping after: " , minuend)

        }
        difference[digit] = minuend[digit] - subtrahend[digit];
        if (difference[digit] < 0) {
            negative = true
        }

    }
    if (negative) {
        difference = null;
    }
    return difference
}

function decimalToBinary(decimalNumber) {
    var binaryNumber = [0]

    while (decimalNumber > 0) {
        decimalNumber--
        binaryNumber = tickBinary(binaryNumber)
    }
    return binaryNumber
}

function addBinaries1(addend1, addend2) {
    var answer = addend2.slice(0, addend2.length);
    var sum = [0];
    while (addend1.indexOf(1) > -1) {
        answer = tickBinary(answer);
        addend1 = subtractBinaries(addend1, [1])
    }
    return answer;
}

function addBinaries(addend1, addend2) {
    //all arrays the same length
    while (addend1.length < addend2.length) {
        addend1.unshift(0)
    }
    while (addend2.length < addend1.length) {
        addend2.unshift(0)
    }
    var answer = [0];
    while (answer.length < addend1.length) {
        answer.unshift(0)
    }
    var regroups = [0];
    while (regroups.length < addend1.length) {
        regroups.unshift(0)
    }



    for (var digit = addend1.length - 1; digit > -1; digit--) {

        answer[digit] = addend1[digit] + addend2[digit] + regroups[digit]

        if (answer[digit] > 1) {
            answer[digit] -= 2;
            if (digit > 0) {
                regroups[digit - 1] = 1;
            }
            else {
                answer.unshift(1)
            }

        }
    }

    return answer;

}

function tickBinary(binaryNumber) {
    var incremented = false;
    for (var i = binaryNumber.length - 1; i > -1; i--) {
        if (binaryNumber[i] == 0 && incremented == false) {
            binaryNumber[i]++
                for (var j = i + 1; j < binaryNumber.length; j++) {
                    binaryNumber[j] = 0;
                }
            incremented = true
        }
    }
    if (!incremented) {
        binaryNumber.push(0)
        for (var i = 1; i < binaryNumber.length; i++) {
            binaryNumber[i] = 0;
        }
    }
    return binaryNumber
}

function binaryToDecimal(binaryNumber) {
    var digitValue = 1;
    var decimalNumber = 0;

    if (binaryNumber == null) {
        binaryNumber = [0]
    }
    for (var i = binaryNumber.length - 1; i > -1; i--) {
        decimalNumber += binaryNumber[i] * digitValue;
        digitValue *= 2;
    }

    return decimalNumber;
}


//***************************************************************************************
//WINDOW RESIZE FUNCTION
//this handles window resizes
$(window).resize(function() {
    if (game.state.current == 'Calculator') {
        resizeGame();
    }
});

var resizeGame = function() {
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE
    var height = window.innerHeight;
    var width = window.innerWidth;

    game.width = width;
    game.height = height;

    game.camera.x = (width * -0.5);
    game.camera.y = (height * -0.5);

    var vBorder = (Math.tan(10 * Math.PI / 180) * game.width) + 200
    var hBorder = (Math.tan(10 * Math.PI / 180) * game.height) + 200

    // var oldPanelX = infoPanelBack.x;
    // var oldPanelY = infoPanelBack.y;
    // infoPanelBack.x = game.width - infoPanelBack.width - 20
    // infoPanelBack.y = game.height - infoPanelBack.height - 15
    // infoPanelText.x -= oldPanelX - infoPanelBack.x
    // infoPanelText.y -= oldPanelY - infoPanelBack.y;
    game.calculator.group.destroy();
    game.calculator = new Calculator();

    game.renderer.resize(width, height);

    // if (window.storeOpen == true) //store menu is showing
    // {
    //     ////console.log("store is open")
    //     window.closeStore();
    //     window.newStore();
    // }
}

//prevent keys from navigating the window away
$(document).unbind('keydown').bind('keydown', function(event) {
    var doPrevent = false;
    if (event.keyCode === 8) {
        var d = event.srcElement || event.target;
        if ((d.tagName.toUpperCase() === 'INPUT' &&
                (
                    d.type.toUpperCase() === 'TEXT' ||
                    d.type.toUpperCase() === 'PASSWORD' ||
                    d.type.toUpperCase() === 'FILE' ||
                    d.type.toUpperCase() === 'SEARCH' ||
                    d.type.toUpperCase() === 'EMAIL' ||
                    d.type.toUpperCase() === 'NUMBER' ||
                    d.type.toUpperCase() === 'DATE')
            ) ||
            d.tagName.toUpperCase() === 'TEXTAREA') {
            doPrevent = d.readOnly || d.disabled;
        }
        else {
            doPrevent = true;
        }
    }

    if (doPrevent) {
        event.preventDefault();
    }
});

