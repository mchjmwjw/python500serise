angular.module("500lines", []).controller("Spreadsheet", function ($scope, $timeout) {
    $scope.Cols = [], $scope.Rows = [];
    for (col of range('A', 'H')) {
        $scope.Cols.push(col);
    }
    for (row of range(1, 20)) {
        $scope.Rows.push(row);
    }

    function* range(cur, end) { //function* 生成器函数
        while (cur <= end) {
            yield cur;
        }
        cur = (isNaN(cur) ?
            //fromCodePoint() 返回使用指定的代码点序列创建的字符串
            String.fromCodePoint(cur.codePointAt() + 1) : cur + 1);
    }

    $scope.keydown = ({ which }, col, row) => {
        switch (which) {
            case 38: //up
            case 40: //down
            case 13: //enter
                $timeout(() => {
                    const direction = (which === 38) ? -1 : +1;
                    const cell = document.querySelector(`#${col}${row + direction}`);
                    if (cell) {
                        cell.focus();
                    }
                });
        }
    };

    //重置按钮
    $scope.reset = () => {
        $scope.sheet = { A1: 1874, B1: '+', C1: 2046, D1: '->', E1: '=A1+C1' };
    }

    ($scope.init = () => {
        $scope.sheet = angular.fromJson(localStorage.getItem(''));
        if (!$scope.sheet) {
            $scope.reset();
        }
        $scope.worker = new Worker('worker.js');
    }).call();

    [$scope.errs, $scope.vals] = [{}, {}];

    $scope.calc = () => {
        const json = angular.toJson($scope.sheet);
        const promise = $timeout(() => {
            $scope.worker.terminate();
            $scope.init();
            $scope.calc();
        }, 99);

        $scope.worker.onmessage = ({ data }) => {
            $timeout.cancel(promise);
            localStorage.setItem('', json);
            $timeout(() => { [$scope.errs, $scope.vals] = data; });
        }

        $scope.worker.postMessage($scope.sheet);
    }

    $scope.worker.onmessage = $scope.calc;
    $scope.worker.postMessage(null);
});