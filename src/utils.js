/**
 * 通用方法
 *
 * @file utils.js
 * @author guyunlong
 */

// 判断是否为函数
const isFunction = value => typeof value === 'function';

// 判断两个对象值是否相等
const isObjectValueEqual = (objA, objB) => {
    let aProps = Object.getOwnPropertyNames(objA);
    let bProps = Object.getOwnPropertyNames(objB);
    if (aProps.length != bProps.length) {
          return false;
    }
    for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i]
        let propA = objA[propName]
        let propB = objB[propName]
        if ((typeof (propA) === 'object')) {
            if (isObjectValueEqual(propA, propB)) {
                return true;
            }
            return false;
        } else if (propA !== propB) {
            return false;
        }

        return true;
    }
};

export {
    isFunction,
    isObjectValueEqual
};
