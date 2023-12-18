   import {MainCircle, AdditionalCircle, Icon, TurnSignal} from "./Circle"
    /**
     * Draws all circles.
     * @param {number} speedometerValue Current speed.
     * @param {number} tachometerValue Curent engine revs.
     * @param {number} gasValue Current gas tank fullness.
     * @param {number} mileage Current mileage.
     * @param {Object} turnSignals Current state of turn signals.
     * @param {Object} iconStates Current state of icons.
     */
    export function draw(ctx, speedometerValue, tachometerValue, gasValue, mileage, turnSignals, iconStates) {
        clearCanvas(ctx);

        const mCircle = new MainCircle(options);
        drawLeftCircle(options, ctx, mCircle.radius, tachometerValue, iconStates);
        drawRightCircle(options, ctx, mCircle.radius, gasValue, iconStates);
        
        mCircle.draw(ctx);

        const addMarksCount = 10;
        const addMarksDegAngle = 180;
        const addMarksAngles = mCircle.calcMarksAngles(addMarksCount, addMarksDegAngle);

        const countMain = 11;
        const degAngleMain = 200;
        const mainMarksAngles = mCircle.calcMarksAngles(countMain, degAngleMain);

        const angles = addMarksAngles
        const length = 7.5
        const lineWidth = 2
        const border = true
        const offset = 4
        const firstNMarks = 0
        const lastNMarks = 0

        mCircle.drawMarks(ctx, angles, length, lineWidth, border, offset, firstNMarks, lastNMarks);

        const angles2 = mainMarksAngles
        const length2 = 7
        const lineWidth2 = 3
        const border2 = true
        const offset2 = 3
        mCircle.drawMarks(ctx, angles2, length2, lineWidth2, border2, offset2);
        
        const countText = 11
        const degAngleText = 200
        const innerOffset = 7.5
        const textMarksAngles = mCircle.calcTextMarksAngles(countText, degAngleText, innerOffset);

        const length3 = 7.5
        const angles3 = textMarksAngles
        const step = 20
        const offset3 = 22.5

        mCircle.drawTextMarks(ctx, length3, angles3, step,offset3)

        mCircle.drawTurnSignal(ctx, 35, -25, 25, 15, turnSignals['right']);
        mCircle.drawTurnSignal(ctx, -35, -25, -25, 15, turnSignals['left']);

        mCircle.drawIcon(ctx, 'dippedBeam', iconStates['dippedBeam']);
        mCircle.drawIcon(ctx, 'brake', iconStates['brake']);
        mCircle.drawIcon(ctx, 'drift', iconStates['drift']);
        mCircle.drawIcon(ctx, 'highBeam', iconStates['highBeam']);
        mCircle.drawIcon(ctx, 'lock', iconStates['lock']);
        mCircle.drawIcon(ctx, 'seatBelt', iconStates['seatBelt']);
        mCircle.drawIcon(ctx, 'engineTemp', iconStates['engineTemp']);
        mCircle.drawIcon(ctx, 'stab', iconStates['stab']);
        mCircle.drawIcon(ctx, 'abs', iconStates['abs']);

        mCircle.drawMileage(ctx, mileage, 0, 60, 100, 20, 2);
        
        mCircle.drawUnit(ctx, -25);
        
        const value = speedometerValue
        const degAngleArrow = 200
        const offset4 = 10
        mCircle.drawArrow(ctx, value, degAngleArrow, offset4);
        mCircle.drawArrowBody(ctx);
    }

   
   /**
     * Clears the canvas. Required when update data on the speedometer.
     */
    function clearCanvas(ctx) {
        ctx.clearRect(0, 0, 580, 260);
    }

    /**
     * Draws left circle (tachometer).
     * @param {Object} options Circle options such as colors, font etc. In more detail in the description of the class.
     * @param {number} radius Radius of main circle (speedometer). Required to correctly calculate the radius of a circle.
     * @param {number} value Current value of tachometer. Min is 0 (lowest), max is 1 (highest).
     * @param {Object} iconStates States of icons displayed on circle.
     */
    function drawLeftCircle(options, ctx, radius, value, iconStates) {
        const lCircle = new AdditionalCircle(options, 'left', radius);
        lCircle.draw(ctx);

        const addMarksCount = 8
        const addMarksDegAngle = 140
        const addMarksStartAngle = 300
        const addMarksAngles = lCircle.calcMarksAngles(addMarksCount, addMarksDegAngle, addMarksStartAngle)

        const countMain = 9
        const degAngleMain = 160
        const startAngleMain = 300
        const mainMarksAngles = lCircle.calcMarksAngles(countMain, degAngleMain, startAngleMain)

        const anglesDangerZone = addMarksAngles
        const offsetDangerZone = 6
        const firstNMarksDangerZone = 0
        const lastNMarksDangerZone = 2
        lCircle.drawDangerZone(ctx, anglesDangerZone, offsetDangerZone, firstNMarksDangerZone, lastNMarksDangerZone)

        const anglesDangerZone1 = mainMarksAngles
        const offsetDangerZone1 = 6
        const firstNMarksDangerZone1 = 0
        const lastNMarksDangerZone1 = 2
        lCircle.drawDangerZone(ctx, anglesDangerZone1, offsetDangerZone1, firstNMarksDangerZone1, lastNMarksDangerZone1)

        const anglesDrawMarks = addMarksAngles
        const lengthDrawMarks = 7.5
        const lineWidthDrawMarks = 2
        const borderDrawMarks = true
        const offsetDrawMarks = 1
        const firstNMarksDrawMarks = 0
        const lastNMarksDrawMarks = 2
        lCircle.drawMarks(ctx, anglesDrawMarks, lengthDrawMarks, lineWidthDrawMarks, borderDrawMarks, offsetDrawMarks, firstNMarksDrawMarks, lastNMarksDrawMarks)

        
        const anglesDrawMarks1 = mainMarksAngles
        const lengthDrawMarks1 = 6
        const lineWidthDrawMarks1 = 3
        const borderDrawMarks1 = true
        const offsetDrawMarks1 = 0
        const firstNMarksDrawMarks1 = 0
        const lastNMarksDrawMarks1 = 2
        lCircle.drawMarks(ctx, anglesDrawMarks1, lengthDrawMarks1, lineWidthDrawMarks1, borderDrawMarks1, offsetDrawMarks1, firstNMarksDrawMarks1, lastNMarksDrawMarks1)
        
        
        const countText = 9
        const degAngleText = 160
        const innerOffset = 5
        const startAngle =300
        const textMarksAngles = lCircle.calcTextMarksAngles(countText, degAngleText, innerOffset, startAngle)

        const lengthTextMarks = 7.5
        const anglesTextMarks = textMarksAngles
        const stepTextMarks = 1
        const offsetTextMarks = 12.5
        lCircle.drawTextMarks(ctx, lengthTextMarks, anglesTextMarks, stepTextMarks, offsetTextMarks)

        lCircle.drawIcon(ctx, 'battery', iconStates['battery']);
        lCircle.drawIcon(ctx, 'oil', iconStates['oil']);
        lCircle.drawIcon(ctx, 'engineFail', iconStates['engineFail']);

        lCircle.drawMultiplier(ctx, 1, -20);

        const degAngleArrow = 160
        const offsetAngleArrow = 5
        const startAngleArrow = 300
        lCircle.drawArrow(ctx, value, degAngleArrow, offsetAngleArrow, startAngleArrow)
        lCircle.drawArrowBody(ctx);
    }

    /**
     * Draws right circle (gas indicator).
     * @param {Object} options Circle options such as colors, font etc. In more detail in the description of the class.
     * @param {number} radius Radius of main circle (speedometer). Required to correctly calculate the radius of a circle.
     * @param {number} value Current value of gas indicator. Min is 0 (lowest), max is 1 (highest).
     * @param {Object} iconStates States of icons displayed on circle.
     */
    function drawRightCircle(options, ctx, radius, value, iconStates) {
        const rCircle = new AdditionalCircle(options, 'right', radius);
        rCircle.draw(ctx);

        const addMarksCount = 8
        const addMarksDegAngle = 140
        const addMarksStartAngle = 80
        const addMarksAngles = rCircle.calcMarksAngles(addMarksCount, addMarksDegAngle, addMarksStartAngle)

        const countMain = 9
        const degAngleMain = 160
        const startAngleMain = 80
        const mainMarksAngles = rCircle.calcMarksAngles(countMain, degAngleMain, startAngleMain)

        const anglesDangerZone = addMarksAngles
        const offsetDangerZone = 6
        const firstNMarksDangerZone = 0
        const lastNMarksDangerZone = 2
        rCircle.drawDangerZone(ctx, anglesDangerZone, offsetDangerZone, firstNMarksDangerZone, lastNMarksDangerZone)


        const anglesDangerZone1 = mainMarksAngles
        const offsetDangerZone1 = 6
        const firstNMarksDangerZone1 = 0
        const lastNMarksDangerZone1 = 2
        rCircle.drawDangerZone(ctx, anglesDangerZone1, offsetDangerZone1, firstNMarksDangerZone1, lastNMarksDangerZone1)
        

        const anglesDrawMarks = addMarksAngles
        const lengthDrawMarks = 7.5
        const lineWidthDrawMarks = 2
        const borderDrawMarks = true
        const offsetDrawMarks = 1
        const firstNMarksDrawMarks = 0
        const lastNMarksDrawMarks = 2
        const skip = 'all'
        const skipFrom = 0
        const skipTo = 5
        rCircle.drawMarks(ctx, anglesDrawMarks, lengthDrawMarks, lineWidthDrawMarks, borderDrawMarks, offsetDrawMarks, firstNMarksDrawMarks, lastNMarksDrawMarks, skip, skipFrom, skipTo)

       
        const anglesDrawMarks1 = mainMarksAngles
        const lengthDrawMarks1 = 6
        const lineWidthDrawMarks1 = 3
        const borderDrawMarks1 = true
        const offsetDrawMarks1 = 0
        const firstNMarksDrawMarks1 = 0
        const lastNMarksDrawMarks1 = 2
        const skip1 = 'even'
        const skipFrom1 = 0
        const skipTo1 = 6
        rCircle.drawMarks(ctx, anglesDrawMarks1, lengthDrawMarks1, lineWidthDrawMarks1, borderDrawMarks1, offsetDrawMarks1, firstNMarksDrawMarks1, lastNMarksDrawMarks1, skip1, skipFrom1, skipTo1)
        

        const countText = 3
        const degAngleText = 160
        const innerOffset = 5
        const startAngle = 80
        const textMarksAngles = rCircle.calcTextMarksAngles(countText, degAngleText, innerOffset, startAngle)

        
        const lengthTextMarks = 7.5
        const anglesTextMarks = textMarksAngles
        const stepTextMarks = 0.5
        const offsetTextMarks = 17.5
        const fractions = true
        const reversed = true
        rCircle.drawTextMarks(ctx, lengthTextMarks, anglesTextMarks, stepTextMarks, offsetTextMarks, fractions, reversed)


        rCircle.drawIcon(ctx, 'gas', iconStates['gas']);
        rCircle.drawIcon(ctx, 'trunk', iconStates['trunk']);
        rCircle.drawIcon(ctx, 'bonnet', iconStates['bonnet']);
        rCircle.drawIcon(ctx, 'doors', iconStates['doors']);

        const valueDrawArrow = Math.abs(value - 1)
        const degAngleArrow = 160
        const offsetAngleArrow = 5
        const startAngleArrow = 80
        rCircle.drawArrow(ctx, valueDrawArrow, degAngleArrow, offsetAngleArrow, startAngleArrow)

        rCircle.drawArrowBody(ctx);
    }


    const icons = {
        // main circle
        'dippedBeam': new Icon(-22.5, 47.5, 10, 150 * 0 + 10 * 1, 17.5, 17.5, 2),
        'brake':      new Icon(-80, 47.5, 10, 150 * 1 + 10 * 2, 17.5, 17.5, 2),
        'drift':      new Icon(0, 47.5, 10, 150 * 2 + 10 * 3, 17.5, 17.5, 2),
        'highBeam':   new Icon(-45, 47.5, 10, 150 * 4 + 10 * 5, 17.5, 17.5, 2),
        'lock':       new Icon(80, 47.5, 10, 150 * 6 + 10 * 7, 17.5, 17.5, 2),
        'seatBelt':   new Icon(45, 47.5, 10, 150 * 8 + 10 * 9, 17.5, 17.5, 2),
        'engineTemp': new Icon(62.5, 70, 10, 150 * 10 + 10 * 11, 17.5, 17.5, 3),
        'stab':       new Icon(22.5, 47.5, 10, 150 * 12 + 10 * 13, 17.5, 17.5, 2),
        'abs':        new Icon(-62.5, 70, 10, 150 * 14 + 10 * 15, 17.5, 17.5, 2),
        // right circle
        'gas':        new Icon(5, 55, 10, 150 * 3 + 10 * 4, 17.5, 17.5, 3),
        'trunk':      new Icon(22.5, 25, 10, 150 * 7 + 10 * 8, 17.5, 17.5, 2),
        'bonnet':     new Icon(-5, 25, 10, 150 * 11 + 10 * 12, 17.5, 17.5, 2),
        'doors':      new Icon(-17.5, 47.5, 10, 150 * 15 + 10 * 16, 17.5, 17.5, 2),
        // left circle
        'battery':    new Icon(17.5, 50, 10, 150 * 5 + 10 * 6, 17.5, 17.5, 3),
        'oil':        new Icon(5, 32.5, 10, 150 * 9 + 10 * 10, 17.5, 17.5, 3),
        'engineFail': new Icon(-10, 50, 10, 150 * 13 + 10 * 14, 17.5, 17.5, 3)
    }

    const turnSignals = {
        'left':  new TurnSignal(-17.5, -40, 20, 15),
        'right': new TurnSignal(17.5, -40, 20, 15)
    }

    const options = {
        'circleBorderWidth': 4,
        'circleBorderColor': '#8b8b8b',
        'circleFillColor': '#000000',
        'markFillColor': '#ffffff',
        'markStrokeColor': '#000000',
        'markFontColor': '#ffffff',
        'markFontSize': '14',
        'markFontStyle': 'italic',
        'markFontFamily': 'Arial, sans-serif',
        'arrowBodyFillColor': '#0d0d0d',
        'arrowBodyStrokeColor': '#212121',
        'arrowColor': '#ff0000',
        'arrowBaseWidth': 2.5,
        'arrowBorderWidth': 3,
        'dangerColor': '#c1272d',
        'dangerZoneWidth': 5,
        'turnSignalColor': '#57d53f',
        'speedUnit': 'km',
        'icons': icons,
        'turnSignal': turnSignals
    }