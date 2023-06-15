function main(): void {
    const document: Document = app.activeDocument;
    const layers: Layers = document.layers;
    const firstLayer: Layer = layers[0];

    // レイヤー1にある上二つのドキュメント枠線を削除
    {
        const removed: PathItem[] = [firstLayer.pathItems[0], firstLayer.pathItems[1]];
        for (var pointIndex = 0; pointIndex < removed.length; pointIndex++) {
            removed[pointIndex].remove();
        }
    }

    // スケールバー部分を別レイヤーに分離・グループ化
    {
        const scaleBarLayer: Layer = layers.add();
        scaleBarLayer.name = "Scale Bar";
        const group: GroupItem = scaleBarLayer.groupItems.add();
        const text: TextFrame = firstLayer.textFrames[0];
        const bar: PathItem = firstLayer.pathItems[firstLayer.pathItems.length - 1];
        register(text, group);
        register(bar, group);
    }
    // 全ての枝をカットして縦棒と横棒にする
    {
        const nodeLayer = layers.add();
        nodeLayer.name = "Nodes";
        var pathIndex: number = 0
        while (pathIndex < firstLayer.pathItems.length) {
            var currentPath: PathItem = firstLayer.pathItems[pathIndex];
            if (currentPath.pathPoints.length != 3) {
                pathIndex++;
                continue;
            }
            register(currentPath, nodeLayer);
            // [0]: 右側の点
            // [1]: 左下の点
            // [2]: 左上の点
            var pointList: PathPoint[] = [currentPath.pathPoints[0], currentPath.pathPoints[1], currentPath.pathPoints[2]];
            pointList.sort(sorter);
            var newPath: PathItem = clone(currentPath, nodeLayer);
            // 左下の点を削除
            var deletedIndex: number = -1;
            for (var pointIndex = 0; pointIndex < newPath.pathPoints.length; pointIndex++) {
                var targetAnchor: Point | [number, number] = newPath.pathPoints[pointIndex].anchor;
                // Y座標が異なる左側の点を探す
                if (targetAnchor[1] != pointList[0].anchor[1] && targetAnchor[0] != pointList[0].anchor[0]) {
                    deletedIndex = pointIndex;
                    break;
                }
            }
            // 右側の点を削除
            currentPath.pathPoints[indexOf(currentPath.pathPoints, pointList[0])].remove();
            // 左側の点を削除
            newPath.pathPoints[deletedIndex].remove();
        }
    }
    // 根の枝の削除
    {
        firstLayer.pathItems[0].remove();
    }
}

/**
 * PathPointの比較関数を表します。
 * @param x 値1
 * @param y 値2
 * @returns 比較結果
 */
function sorter(x: PathPoint, y: PathPoint): number {
    if (x.anchor[0] != y.anchor[0]) {
        return y.anchor[0] - x.anchor[0];
    }
    return y.anchor[1] - x.anchor[1];
}

/**
 * 指定した座標のインスタンスのうち最初のもののインデックスを取得します。
 * @param list 検索先リスト
 * @param value 検索要素
 * @returns valueのインデックス。存在しない場合は-1
 */
function indexOf(list: PathPoints, value: PathPoint): number {
    for (var i = 0; i < list.length; i++) {
        if (value.anchor[0] == list[i].anchor[0] && value.anchor[1] == list[i].anchor[1]) {
            return i;
        }
    }
    return -1;
}

/**
 * オブジェクトの所属を変更します。
 * @param obj 所属を変更するオブジェクト
 * @param dest 追加先所属
 */
function register(obj: PageItem, dest: Layer | GroupItem): void {
    // @ts-ignore
    const location = ElementPlacement.PLACEATEND;
    obj.move(dest, location);
}

/**
 * オブジェクトを複製します。
 * @param obj 複製するオブジェクト
 * @param dest 複製後の登録先
 * @returns 複製された新しいオブジェクト
 */
function clone<TObj extends PageItem>(obj: TObj, dest: Layer | GroupItem): TObj {
    // @ts-ignore
    const location = ElementPlacement.PLACEATEND;
    return obj.duplicate(dest, location) as TObj;
}

main();
