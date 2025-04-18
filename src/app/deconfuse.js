import {parse} from '@babel/parser';
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import * as t from '@babel/types';


const transform = (sourceCode) => {
    
    let ast = parse(sourceCode);
    var newAst = parse('');
    var decryptFuncNameArray = new Array();
    var variableNameArray = new Array();
    traverse(ast, {
        FunctionDeclaration(path){
            var {node} = path;
            if (t.isBlockStatement(node.body) && node.body.body.length === 3){
                var b1 = node.body.body[0];
                if (t.isVariableDeclaration(b1) && b1.declarations.length === 1){
                    if (t.isArrayExpression(b1.declarations[0].init)){
                        var arrName = b1.declarations[0].id.name;
                        var b2 = node.body.body[1];
                        if (t.isExpressionStatement(b2) && t.isAssignmentExpression(b2.expression) && t.isIdentifier(b2.expression.left) && t.isFunctionExpression(b2.expression.right)){
                            var funcName = b2.expression.left.name;
                            if (t.isBlockStatement(b2.expression.right.body) && t.isReturnStatement(b2.expression.right.body.body[0])){
                                if (t.isIdentifier(b2.expression.right.body.body[0].argument) && b2.expression.right.body.body[0].argument.name === arrName){
                                    var b3 = node.body.body[2];
                                    if (t.isReturnStatement(b3) && t.isCallExpression(b3.argument) && t.isIdentifier(b3.argument.callee) && b3.argument.callee.name === funcName){
                                        newAst.program.body.push(node);
                                        // ast.program.body.splice(i, 1);
                                        path.remove();
                                        variableNameArray.push(node.id.name);
                                        console.log('发现大数组声明：', node.id.name)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        // VariableDeclaration(path){
        //     var {node} = path;
        //     if (node.declarations.length === 1){
        //         if (t.isArrayExpression(node.declarations[0].init)){
        //             // newAst.program.body.push(node);
        //             // ast.program.body.splice(i, 1);
        //             // path.remove();
        //             variableNameArray.push(node.declarations[0].id.name);
        //             console.log('发现大数组声明：', node.declarations[0].id.name)
        //         }
        //     }
        // }
    })


    traverse(ast, {
        ExpressionStatement(path){
            var {node} = path;
            if (node.expression && t.isCallExpression(node.expression)){
                if (node.expression.arguments.length == 2){
                    var arg1 = node.expression.arguments[0];
                    var arg2 = node.expression.arguments[1];
                    if (t.isIdentifier(arg1) && t.isNumericLiteral(arg2) && variableNameArray.indexOf(arg1.name) > -1){
                        newAst.program.body.push(node);
                        // ast.program.body.splice(i, 1);
                        path.remove();
                        console.log('发现乱序自执行函数');
                    }
                }
            }
            // else if (node.expression && t.isSequenceExpression(node.expression)){
            //     for (var j = 0; j < node.expression.expressions.length; j++){
            //         var expNode = node.expression.expressions[j];
            //         if (t.isCallExpression(expNode) && expNode.arguments.length == 2){
            //             arg1 = expNode.arguments[0];
            //             arg2 = expNode.arguments[1];
            //             console.log(t.isIdentifier(arg1))
            //             if (t.isIdentifier(arg1) && t.isNumericLiteral(arg2) && variableNameArray.indexOf(arg1.name) > -1){
            //                 newAst.program.body.push(t.expressionStatement(expNode));
            //                 ast.program.body[i].expression.expressions.splice(j, 1);
            //                 console.log('发现乱序自执行函数');
            //             }
            //         }
            //     }
            // }
        }
    })


    traverse(ast, {
        VariableDeclaration(path){
            var {node} = path;
            if(node.declarations.length === 1 && t.isFunctionExpression(node.declarations[0].init) && t.isBlockStatement(node.declarations[0].init.body)){
                var b = node.declarations[0].init.body.body;
                var lb = b[b.length - 1]
                if (t.isReturnStatement(lb) && t.isIdentifier(lb.argument)){
                    var lbn = lb.argument.name;
                    var isFindFunc = false;
                    for (var j = 0; j < b.length - 1; j++){
                        var bj = b[j];
                        if (t.isVariableDeclaration(bj) && b[j].declarations.length === 1){
                            var dec1 = bj.declarations[0];
                            if (dec1.id.name === lbn){
                                if (t.isMemberExpression(dec1.init) && t.isIdentifier(dec1.init.object) && variableNameArray.indexOf(dec1.init.object.name) > -1){
                                    isFindFunc = true;
                                }
                            }
                        }
                    }
                    if (isFindFunc){
                        newAst.program.body.push(node);
                        // ast.program.body.splice(i, 1);
                        path.remove();
                        decryptFuncNameArray.push(node.declarations[0].id.name);
                        console.log('发现数组解密函数：', node.declarations[0].id.name)
                    }
                }
            }
        },
        FunctionDeclaration(path){
            var {node} = path;
            if (t.isBlockStatement(node.body) && node.body.body.length === 3){
                var b1 = node.body.body[0];
                if (t.isVariableDeclaration(b1) && b1.declarations.length === 1){
                    if (t.isCallExpression(b1.declarations[0].init) && t.isIdentifier(b1.declarations[0].init.callee) && variableNameArray.indexOf(b1.declarations[0].init.callee.name) > -1){
                        var arrName = b1.declarations[0].id.name;
                        var b2 = node.body.body[1];
                        if (t.isExpressionStatement(b2) && t.isAssignmentExpression(b2.expression) && t.isIdentifier(b2.expression.left) && t.isFunctionExpression(b2.expression.right)){
                            var funcName = b2.expression.left.name;
                            
                            var b3 = node.body.body[2];
                            if (t.isReturnStatement(b3) && t.isCallExpression(b3.argument) && t.isIdentifier(b3.argument.callee) && b3.argument.callee.name === funcName){
                                newAst.program.body.push(node);
                                // ast.program.body.splice(i, 1);
                                path.remove();
                                decryptFuncNameArray.push(node.id.name);
                                console.log('发现数组解密函数：', node.id.name)
                            }
                        }
                        
                    }
                }
            }
            else if (t.isBlockStatement(node.body) && node.body.body.length === 2){
                var b1 = node.body.body[0];
                if (t.isVariableDeclaration(b1) && b1.declarations.length === 1){
                    if (t.isCallExpression(b1.declarations[0].init) && t.isIdentifier(b1.declarations[0].init.callee) && variableNameArray.indexOf(b1.declarations[0].init.callee.name) > -1){
                        var arrName = b1.declarations[0].id.name;
                        if (t.isReturnStatement(node.body.body[1]) && t.isSequenceExpression(node.body.body[1].argument)){
                            var b2 = node.body.body[1].argument.expressions[0];
                            if (t.isAssignmentExpression(b2) && t.isIdentifier(b2.left) && t.isFunctionExpression(b2.right)){
                                var funcName = b2.left.name;
                                
                                var b3 = node.body.body[1].argument.expressions[1];
                                if (t.isCallExpression(b3) && t.isIdentifier(b3.callee) && b3.callee.name === funcName){
                                    newAst.program.body.push(node);
                                    // ast.program.body.splice(i, 1);
                                    path.remove();
                                    decryptFuncNameArray.push(node.id.name);
                                    console.log('发现数组解密函数：', node.id.name)
                                }
                            }
                        }
                    }
                }
            }
        }
    })


    traverse(ast, {
        FunctionDeclaration(path){
            var {node} = path;
            if (t.isBlockStatement(node.body) && node.body.body.length === 1){
                var b1 = node.body.body[0];
                if (t.isReturnStatement(b1) && t.isCallExpression(b1.argument) && t.isIdentifier(b1.argument.callee) && decryptFuncNameArray.indexOf(b1.argument.callee.name) !== -1){
                    newAst.program.body.push(node);
                    // ast.program.body.splice(i, 1);
                    path.remove();
                    decryptFuncNameArray.push(node.id.name);
                    console.log('发现数组解密函数：', node.id.name)
                }
            }
        }
    })
    const envCode = generator(newAst, {compact: true}).code
    window.eval(envCode);
    
    const visitor = {
        VariableDeclarator: function(path){
            const {node} = path;
            if (node.init && decryptFuncNameArray.indexOf(node.init.name) > -1 && t.isIdentifier(node.id)){
                eval(path.toString())
                var binding = path.scope.getBinding(node.id.name);
                binding && binding.referencePaths.map(function(v){
                    v.parentPath.isCallExpression() && v.parentPath.replaceWith(
                        t.stringLiteral(eval(v.parentPath + ''))
                    )
                });
                decryptFuncNameArray.push(node.id.name);
                path.remove();
            }
        },
        // ReturnStatement(path){
        //     const {node} = path;
        //     if (t.isCallExpression(node.argument) && decryptFuncNameArray.indexOf(node.argument.callee.name) > -1){
        //         console.log(node.argument.callee.name);
        //         func = path.getFunctionParent();
        //         eval(func.toString());
        //         binding = func.scope.getBinding(func.node.id.name);
        //         binding && binding.referencePaths.map(function(v){
        //             v.parentPath.isCallExpression() && v.parentPath.replaceWith(
        //                 t.stringLiteral(eval(v.parentPath + ''))
        //             )
        //         });
        //         func.remove();
        //     }
        // },
        CallExpression(path){
            const {node} = path;
            if (t.isIdentifier(node.callee) &&  decryptFuncNameArray.indexOf(node.callee.name) > -1){
                path.replaceWith(t.stringLiteral(eval(path + '')))
            }
        }
    }

    traverse(ast, visitor);

    var totalObj = {};

    function initTotalObj(num){
        traverse(ast, {
            VariableDeclarator(path){
                const {node} = path;
                if(t.isObjectExpression(node.init)){
                    if (totalObj.hasOwnProperty(node.id.name) && num===0){
                        console.log('大对象名重复：' + node.id.name);
                    }else{
                        totalObj[node.id.name] = {};
                    }
                    node.init.properties.map(function(op){
                        if (op.key.value.length ===5){
                            totalObj[node.id.name][op.key.value] = op.value;
                        }
                    })
                }
            }
        })
    };
    initTotalObj(0);


    function findRealNode(node){
        if (t.isMemberExpression(node)){
            if (totalObj[node.object.name] && totalObj[node.object.name][node.property.value]){
                return findRealNode(totalObj[node.object.name][node.property.value]);
            }
        }
        else if (t.isFunctionExpression(node) && node.body.body.length === 1){
            const statement = node.body.body[0];
            if (t.isReturnStatement(statement) && t.isCallExpression(statement.argument) && t.isMemberExpression(statement.argument.callee)){
                const member = statement.argument.callee;

                const arg = statement.argument.arguments;
                var allAreIdentifer = false;
                for (var i=0; i<arg.length; i++){
                    if (t.isIdentifier(arg[i])){
                        allAreIdentifer = true
                    }
                }
                if (t.isStringLiteral(member.property) && member.property.value.length === 5 && allAreIdentifer){
                    if (totalObj[member.object.name] && totalObj[member.object.name][member.property.value]){
                        var nn = findRealNode(totalObj[member.object.name][member.property.value])
                        return nn;
                    }
                }else{
                    return node;
                }
            }else{
                return node;
            }
        }
        else {
            return node;
        }
    }

    traverse(ast, {
        VariableDeclarator(path){
            const {node} = path;
            if(t.isObjectExpression(node.init)){
                node.init.properties.map(function(op){
                    const realnode = findRealNode(op.value);

                    if (realnode){
                        op.value = realnode;
                    }
                })
            }
        }
    })

    initTotalObj(1);

    traverse(ast, {
        MemberExpression: function(path){
            const {node} = path;
            if (totalObj.hasOwnProperty(node.object.name) && t.isStringLiteral(node.property) && node.property.value.length === 5){
                if (t.isStringLiteral(totalObj[node.object.name][node.property.value])){
                    path.replaceWith(totalObj[node.object.name][node.property.value])
                }
            }
            
        }
    })

    traverse(ast, {
        CallExpression: function(path){
            const {node} = path;
            if (t.isMemberExpression(node.callee)){
                const {callee} = node;
                if (totalObj[callee.object.name] && totalObj[callee.object.name][callee.property.value]){
                    const funcNode = totalObj[callee.object.name][callee.property.value];
                    if (t.isBlockStatement(funcNode.body)){
                        const statement = funcNode.body.body[0];
                        if(t.isReturnStatement(statement)){
                            
                            if(t.isBinaryExpression(statement.argument)){
                                path.replaceWith(
                                    t.binaryExpression(statement.argument.operator, node.arguments[0], node.arguments[1])
                                )
                            }
                            else if (t.isLogicalExpression(statement.argument)){
                                path.replaceWith(
                                    t.logicalExpression(statement.argument.operator, node.arguments[0], node.arguments[1])
                                )
                            }
                            else if(t.isCallExpression(statement.argument)){
                                const arg1 = node.arguments.shift();
        
                                path.replaceWith(
                                    t.callExpression(arg1, node.arguments)
                                )
                            }
                        }
                    }
                }
            }
        }
    })

    do {
        var continueFind = false;
        traverse(ast, {
            BinaryExpression(path){
                const {node} = path;
                const {left, right} = node;
                if (t.isNumericLiteral(left) || t.isUnaryExpression(left) && t.isNumericLiteral(left.argument)){
                    if (t.isNumericLiteral(right) || t.isUnaryExpression(right) && t.isNumericLiteral(right.argument)){
                        const {operator} = node;
                        if (operator === '^' || operator === '+' || operator == '-' || operator == '*'){
                            path.replaceWith(t.valueToNode(eval(path.toString())))
                            continueFind = true;
                        }
                    }
                }
            }
        })
    } while (continueFind);

    traverse(ast, {
        IfStatement(path){
            const {node} = path;
            const {test} = node;
            if (t.isBinaryExpression(test) && t.isStringLiteral(test.left) && t.isStringLiteral(test.right)){            
                if (eval('"' + test.left.value + '"' + test.operator + '"' + test.right.value + '"')){
                    path.replaceWithMultiple(node.consequent.body)
                }else{
                    path.replaceWithMultiple(node.alternate.body)
                }
            }
        },
        UnaryExpression: {
            exit(path){
                const {node} = path;
                if (node.argument.elements){
                    
                }
            }
        },
        CallExpression(path){
            if (path.toString().endsWith('".split("").reverse().join("")')){
                path.replaceWith(t.valueToNode(eval(path.toString())))
            }
            
        }
    })

    // 还原流程平坦化
    traverse(ast, {
        VariableDeclaration: function(path){
            var {node} = path;
            var swDec = node.declarations[0];
            var swName = swDec.id.name;
            if (t.isCallExpression(swDec.init)){
                if (swDec.init.arguments.length === 1){
                    if (t.isStringLiteral(swDec.init.arguments[0]) && swDec.init.arguments[0].value == '|'){
                        if (t.isMemberExpression(swDec.init.callee) && t.isStringLiteral(swDec.init.callee.property) && swDec.init.callee.property.value == 'split'){

                            if (t.isStringLiteral(swDec.init.callee.object) && swDec.init.callee.object.value.indexOf('|') > -1){
                                var orderArray = swDec.init.callee.object.value.split('|');
                                if (node.declarations.length === 2){
                                    var adder = node.declarations[1];
                                    var adderName = adder.id.name;
                                    if (t.isNumericLiteral(adder.init) && adder.init.value === 0){
                                        var whileP = path.getSibling(path.key + 1);
                                        var whileS = whileP.node;
                                        if (t.isWhileStatement(whileS) && t.isBlockStatement(whileS.body) && whileS.body.body.length === 2){
                                            var body1 = whileS.body.body[0];
                                            var body2 = whileS.body.body[1];
                                            if (t.isSwitchStatement(body1) && t.isBreakStatement(body2)){
                                                if (t.isMemberExpression(body1.discriminant) && body1.discriminant.object.name === swName){
                                                    if (t.isUpdateExpression(body1.discriminant.property) && t.isIdentifier(body1.discriminant.property.argument)){
                                                        if(body1.discriminant.property.argument.name === adderName && body1.discriminant.property.operator === '++'){
                                                            var swcs = new Object();
                                                            for (var i = 0; i < body1.cases.length; i++){
                                                                swcs[body1.cases[i].test.value] = body1.cases[i].consequent;
                                                            }
                                                            // console.log(swcs)
                                                            var realBody = new Array();
                                                            for (var j = 0; j < orderArray.length; j++){
                                                                for (var k = 0; k < swcs[orderArray[j]].length; k++)
                                                                    if (!t.isContinueStatement(swcs[orderArray[j]][k])){
                                                                        realBody.push(swcs[orderArray[j]][k]);
                                                                    }
                                                            }
                                                            // console.log(typeof realBody[0]);
                                                            whileP.replaceWithMultiple(realBody);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else if (node.declarations.length === 1){
                                    var whileP = path.getSibling(path.key + 2);
                                    var whileS = whileP.node;
                                    if (t.isWhileStatement(whileS) && t.isBlockStatement(whileS.body) && whileS.body.body.length === 2){
                                        body1 = whileS.body.body[0];
                                        body2 = whileS.body.body[1];
                                        if (t.isSwitchStatement(body1) && t.isBreakStatement(body2)){
                                            if (t.isMemberExpression(body1.discriminant) && body1.discriminant.object.name === swName){
                                                if (t.isUpdateExpression(body1.discriminant.property) && t.isIdentifier(body1.discriminant.property.argument)){
                                                    if(body1.discriminant.property.operator === '++'){
                                                        swcs = new Object();
                                                        for (var i = 0; i < body1.cases.length; i++){
                                                            swcs[body1.cases[i].test.value] = body1.cases[i].consequent;
                                                        }
                                                        // console.log(swcs)
                                                        var realBody = new Array();
                                                        for (var j = 0; j < orderArray.length; j++){
                                                            for (var k = 0; k < swcs[orderArray[j]].length; k++)
                                                                if (!t.isContinueStatement(swcs[orderArray[j]][k])){
                                                                    realBody.push(swcs[orderArray[j]][k]);
                                                                }
                                                        }
                                                        // console.log(typeof realBody[0]);
                                                        whileP.replaceWithMultiple(realBody);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
            }
        }
    })

    let decode = generator(ast, {minified: true, jsescOption: {minimal: true}}).code // 这里一键还原了 unicode 与 十六进制，但是代码是 的

    ast = parse(decode)

    traverse(ast, {
        VariableDeclaration: function(path){
            if (path.node.declarations.length === 1){
                if (t.isObjectExpression(path.node.declarations[0].init)){
                    var binding = path.scope.getBinding(path.node.declarations[0].id.name);
                    if (binding && binding.referencePaths.length === 0){
                        console.log('删除大对象：', path.node.declarations[0].id.name)
                        path.remove();
                    }
                }
                
            }
            else {
                for (var i = 0; i < path.node.declarations.length; i++){
                    var dec = path.node.declarations[i];
                    if (t.isIdentifier(dec.id) && t.isObjectExpression(dec.init)){
                        var binding = path.scope.getBinding(dec.id.name);
                        if (binding && binding.referencePaths.length === 0){
                            console.log('删除大对象：', path.node.declarations[0].id.name);
                            path.node.declarations.splice(i, 1);
                        }
                    }
                }
            }
        },
        // 删除未使用的函数，仅能在单文件混淆使用，多文件勿用
        // FunctionDeclaration(path){
        //     var binding = path.scope.getBinding(path.node.id.name);
        //     if (binding && binding.referencePaths.length === 0){
        //         console.log(path.node.id.name);
        //         path.remove();
        //     }
        // }
    })
    const output = generator(ast) // 再转一次 为了使代码格式化
    // r.setValue(output.code)
    console.log(output.code)
    return output.code
    // document.getElementById("result").innerHTML = output.code
}

export default transform;