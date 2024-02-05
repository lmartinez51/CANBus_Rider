   import {MainCircle, LMainCircle, AdditionalCircle, Icon, TurnSignal} from "./Circle"
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

        const lmCircle = new LMainCircle(options);
        const rmCircle = new MainCircle(options);
        drawLeftCircle(options, ctx, rmCircle.radius, tachometerValue, iconStates);
        drawRightCircle(options, ctx, rmCircle.radius, gasValue, iconStates);

        /* Left Main Circle - Tachometer */
        lmCircle.draw(ctx);
        const lAddMarksCount = 8;
        const lAddMarksDegAngle = 180;
        const lAddMarksAngles = rmCircle.calcMarksAngles(lAddMarksCount, lAddMarksDegAngle);

        const lCountMain = 9;
        const lDegAngleMain = 207;
        const lMainMarksAngles = rmCircle.calcMarksAngles(lCountMain, lDegAngleMain);

        const langles = lAddMarksAngles
        const llength = 7.5
        const llineWidth = 2
        const lborder = true
        const loffset = 4
        const lfirstNMarks = 0
        const llastNMarks = 2
        lmCircle.drawMarks(ctx, langles, llength, llineWidth, lborder, loffset, lfirstNMarks, llastNMarks);

        const langles2 = lMainMarksAngles
        const llength2 = 6
        const llineWidth2 = 3
        const lborder2 = true
        const loffset2 = 3
        const lfirstNMarksDrawMarks1 = 0
        const llastNMarksDrawMarks1 = 2
        lmCircle.drawMarks(ctx, langles2, llength2, llineWidth2, lborder2, loffset2, lfirstNMarksDrawMarks1, llastNMarksDrawMarks1);

        // Draw numbers 0 - 8
        const lcountText = 9
        const ldegAngleText = 207
        const linnerOffset = 7.5
        const ltextMarksAngles = rmCircle.calcTextMarksAngles(lcountText, ldegAngleText, linnerOffset);

        const llength3 = 7.5
        const langles3 = ltextMarksAngles
        const lstep = 1
        const loffset3 = 26

        lmCircle.drawTextMarks(ctx, llength3, langles3, lstep, loffset3)

        // Draw Icons
        lmCircle.drawIcon(ctx, 'dippedBeam', iconStates['dippedBeam']);
        lmCircle.drawIcon(ctx, 'highBeam', iconStates['highBeam']);
        lmCircle.drawIcon(ctx, 'abs', iconStates['abs']);
        lmCircle.drawIcon(ctx, 'trunk', iconStates['trunk']);
        lmCircle.drawIcon(ctx, 'bonnet', iconStates['bonnet']);
        lmCircle.drawIcon(ctx, 'doors', iconStates['doors']);
        lmCircle.drawIcon(ctx, 'engineFail', iconStates['engineFail']);
        lmCircle.drawIcon(ctx, 'lock', iconStates['lock']);
        lmCircle.drawIcon(ctx, 'brake', iconStates['brake']);
        lmCircle.drawIcon(ctx, 'drift', iconStates['drift']);
        lmCircle.drawIcon(ctx, 'stab', iconStates['stab']);
        lmCircle.drawIcon(ctx, 'oil', iconStates['oil']);
        lmCircle.drawIcon(ctx, 'battery', iconStates['battery']);

        lmCircle.drawMultiplier(ctx, 1, -65);
        const lvalue = tachometerValue
        const ldegAngleArrow = 207
        const loffset4 = 10
        lmCircle.drawArrow(ctx, lvalue, ldegAngleArrow, loffset4);
        lmCircle.drawArrowBody(ctx);
        
        /* Right Main Circle - Speedometer */
        rmCircle.draw(ctx);

        const addMarksCount = 10;
        const addMarksDegAngle = 180;
        const addMarksAngles = rmCircle.calcMarksAngles(addMarksCount, addMarksDegAngle);

        const countMain = 11;
        const degAngleMain = 200;
        const mainMarksAngles = rmCircle.calcMarksAngles(countMain, degAngleMain);

        const angles = addMarksAngles
        const length = 7.5
        const lineWidth = 2
        const border = true
        const offset = 4
        const firstNMarks = 0
        const lastNMarks = 0

        rmCircle.drawMarks(ctx, angles, length, lineWidth, border, offset, firstNMarks, lastNMarks);

        const angles2 = mainMarksAngles
        const length2 = 7
        const lineWidth2 = 3
        const border2 = true
        const offset2 = 3
        rmCircle.drawMarks(ctx, angles2, length2, lineWidth2, border2, offset2);
        
        const countText = 11
        const degAngleText = 200
        const innerOffset = 7.5
        const textMarksAngles = rmCircle.calcTextMarksAngles(countText, degAngleText, innerOffset);

        const length3 = 7.5
        const angles3 = textMarksAngles
        const step = 20
        const offset3 = 22.5

        rmCircle.drawTextMarks(ctx, length3, angles3, step,offset3)

        rmCircle.drawTurnSignal(ctx, 35, -25, 25, 15, turnSignals['right']);
        rmCircle.drawTurnSignal(ctx, -35, -25, -25, 15, turnSignals['left']);


        // Draw Icons
        rmCircle.drawIcon(ctx, 'seatBelt', iconStates['seatBelt'])
        rmCircle.drawIcon(ctx, 'hazzard', iconStates['hazzard'])

        rmCircle.drawMileage(ctx, mileage, 0, 60, 100, 20, 2)
        
        rmCircle.drawUnit(ctx, -25)
        
        const value = speedometerValue
        const degAngleArrow = 200
        const offset4 = 10
        rmCircle.drawArrow(ctx, value, degAngleArrow, offset4);
        rmCircle.drawArrowBody(ctx)
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

        const addMarksCount = 4
        const addMarksDegAngle = 180
        const addMarksStartAngle = 270
        const addMarksAngles = lCircle.calcMarksAngles(addMarksCount, addMarksDegAngle, addMarksStartAngle)

        const countMain = 2
        const degAngleMain = 180
        const startAngleMain = 270
        const mainMarksAngles = lCircle.calcMarksAngles(countMain, degAngleMain, startAngleMain)

        const anglesDrawMarks = addMarksAngles
        const lengthDrawMarks = 7.5
        const lineWidthDrawMarks = 2
        const borderDrawMarks = true
        const offsetDrawMarks = 1
        const firstNMarksDrawMarks = 0
        const lastNMarksDrawMarks = 0
        lCircle.drawMarks(ctx, anglesDrawMarks, lengthDrawMarks, lineWidthDrawMarks, borderDrawMarks, offsetDrawMarks, firstNMarksDrawMarks, lastNMarksDrawMarks)

        const anglesDrawMarks1 = mainMarksAngles
        const lengthDrawMarks1 = 6
        const lineWidthDrawMarks1 = 3
        const borderDrawMarks1 = true
        const offsetDrawMarks1 = 0
        const firstNMarksDrawMarks1 = 0
        const lastNMarksDrawMarks1 = 0
        lCircle.drawMarks(ctx, anglesDrawMarks1, lengthDrawMarks1, lineWidthDrawMarks1, borderDrawMarks1, offsetDrawMarks1, firstNMarksDrawMarks1, lastNMarksDrawMarks1)

        const countText = 2
        const degAngleText = 180
        const innerOffset = 5
        const startAngle = 270
        const textMarksAngles = lCircle.calcTextMarksAngles(countText, degAngleText, innerOffset, startAngle)

        const lengthTextMarks = 7.5
        const anglesTextMarks = textMarksAngles
        const stepTextMarks = 1
        const offsetTextMarks = 12.5
        lCircle.drawTextMarks(ctx, lengthTextMarks, anglesTextMarks, stepTextMarks, offsetTextMarks)

        lCircle.drawIcon(ctx, 'engineTemp', iconStates['engineTemp'])

        const degAngleArrow = 180
        const offsetAngleArrow = 5
        const startAngleArrow = 270
        lCircle.drawArrow(ctx, value, degAngleArrow, offsetAngleArrow, startAngleArrow)
        lCircle.drawArrowBody(ctx)
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

        const valueDrawArrow = Math.abs(value - 1)
        const degAngleArrow = 160
        const offsetAngleArrow = 5
        const startAngleArrow = 80
        rCircle.drawArrow(ctx, valueDrawArrow, degAngleArrow, offsetAngleArrow, startAngleArrow)

        rCircle.drawArrowBody(ctx);
    }


    const icons = {
        // Left Main circle
        'dippedBeam': new Icon(-15, -45, 10, 150 * 0 + 10 * 1, 23.5, 23.5, 2),
        'highBeam':   new Icon(-50, -45, 10, 150 * 4 + 10 * 5, 23.5, 23.5, 2),
        'abs':        new Icon(-50, -15, 10, 150 * 14 + 10 * 15, 23.5, 23.5, 2),

        'drift':      new Icon(15, -45, 10, 150 * 2 + 10 * 3, 23.5, 23.5, 2),
        'stab':       new Icon(47, -45, 10, 150 * 12 + 10 * 13, 22.5, 22.5, 2),
        'engineFail': new Icon(47, -15, 10, 150 * 13 + 10 * 14, 23.5, 23.5, 3),
        'lock':       new Icon(47, 10, 10, 150 * 6 + 10 * 7, 23.5, 23.5, 2),

        'bonnet':     new Icon(-50, 45, 10, 150 * 11 + 10 * 12, 25.5, 25.5, 2),
        'trunk':      new Icon(0, 45, 10, 150 * 7 + 10 * 8, 25.5, 25.5, 2),
        'doors':      new Icon(47, 45, 10, 150 * 15 + 10 * 16, 23.5, 23.5, 2),

        'brake':      new Icon(-50, 75, 10, 150 * 1 + 10 * 2, 23.5, 23.5, 4),
        'oil':        new Icon(0, 75, 10, 150 * 9 + 10 * 10, 23.5, 23.5, 3),
        'battery':    new Icon(47, 75, 10, 150 * 5 + 10 * 6, 23.5, 23.5, 3),

        // Right Main Circle
        'hazzard': new Icon(0, -60, 10, 150 * 16 + 10 * 17, 25.5, 25.5, 2),
        'seatBelt':   new Icon(0, 42, 10, 150 * 8 + 10 * 9, 24.5, 24.5, 2),

        // Right circle
        'gas':        new Icon(-35, 0, 10, 150 * 3 + 10 * 4, 23.5, 23.5, 3),

        // Left circle
        'engineTemp': new Icon(35, 0, 10, 150 * 10 + 10 * 11, 22.5, 22.5, 3),
    }

    const turnSignals = {
        'left':  new TurnSignal(-17.5, -40, 20, 15),
        'right': new TurnSignal(17.5, -40, 20, 15)
    }

    const options = {
        'circleBorderWidth': 4,
        'circleBorderColor': '#ffffff',//'#8b8b8b',
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