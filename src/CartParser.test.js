import CartParser from './CartParser';

let parser, validateCartContents;

beforeEach(() => {
    parser = new CartParser();
    validateCartContents = parser.validate.bind(parser);
});

describe("CartParser - unit tests", () => {

    test(`should validate correct header -  add 0 'header' error to array of validation errors`, () => {
        const contents = `Product name,Price,Quantity`;

        parser.createError = jest.fn();
        validateCartContents(contents);

        expect(parser.createError).toHaveBeenCalledTimes(0);
    });



    test(`should add 2 'header' error to array of validation errors`, () => {
        const contents = `Product name,Pri344343ce,Qu0tity`;

        parser.createError = jest.fn();
        validateCartContents(contents);

        expect(parser.createError).toHaveBeenCalledTimes(2);
    });



    test(`should validate correct row item -  add 0 'row' or 'cell' error to array of validation errors`, () => {
        const contents =
            `Product name,Price,Quantity
            Mollis consequat,9.00,2`;

        parser.createError = jest.fn();
        validateCartContents(contents);

        expect(parser.createError).toHaveBeenCalledTimes(0);
    });



    test(`should add 'row' error to array of validation errors`, () => {
        const contents =
            `Product name,Price,Quantity
            Mollis consequat,9.00`;

        parser.createError = jest.fn();
        validateCartContents(contents);

        expect(parser.createError).toHaveBeenCalledTimes(1);
    });



    test(`should add 'cell empty string' error to array of validation errors`, () => {
        const contents =
            `Product name,Price,Quantity
            ,9.00,2`;

        parser.createError = jest.fn();
        validateCartContents(contents);

        expect(parser.createError).toHaveBeenCalledWith('cell', 1, 0, 'Expected cell to be a nonempty string but received \"\".');
    });



    test(`should add 'cell non positive number' error to array of validation errors`, () => {
        const contents =
            `Product name,Price,Quantity
            Mollis consequat,-9.00,24f`;

        const expected = [{
            type: 'cell',
            row: 1,
            column: 1, // або "column": 2
            message: 'Expected cell to be a positive number but received \"-9.00\".'
        }];

        expect(validateCartContents(contents)).toEqual(expect.arrayContaining(expected)); //або "message": "Expected cell to be a positive number but received \"24f\"."
    });



    test(`should correctly parse profuct csvLine 'Mollis consequat,9.00,2'`, () => {
        const parseLine = 'Mollis consequat,9.00,2';

        const parseredObj = parser.parseLine(parseLine);

        expect(parseredObj).toEqual({ id: expect.stringMatching(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/), name: 'Mollis consequat', price: 9, quantity: 2 });
    });

    //     test(`should parseLine all items, without header`, () => {
    //         parser.readFile = jest.fn(() => {
    //             return `Product name,Price,Quantity
    //             Mollis consequat,9.00,2`;
    //         });

    //         parser.parseLine = jest.fn();

    //         parser.calcTotal = jest.fn();



    //         expect(() =>{  parser.parse();})).toHaveBeenCalledTimes(1);
    //    });



    test(`should trow 'Validation failed!' error`, () => {
        parser.readFile = jest.fn();
        parser.validate = jest.fn(() => {
            return [{}, {}, {}];
        });

        const runParser = () => { parser.parse(); };

        expect(runParser).toThrow('Validation failed!');
    });

});




describe("CartParser - integration tests", () => {
    // Add your integration tests here.

    test(`should parse 'samples/cart.csv' file correctly`, () => {

        const path = "samples/cart.csv";

        parser.createError = jest.fn();

        const parsedResult = parser.parse(path);


        expect(parser.createError).toHaveBeenCalledTimes(0);
        expect(parsedResult.items.length).toBe(5);
        expect(parsedResult.total).toBeCloseTo(348.32);
    });

});