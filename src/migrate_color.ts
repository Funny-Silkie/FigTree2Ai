function migrate_color(): void {
    const layerNames: string[] = getLayerNames();

    // ウィンドウ
    const WINDOW_WIDTH = 280;
    const window = new Window("dialog", "色で分離", createPositionBounds(0, 0, WINDOW_WIDTH, 165));
    window.center();
    const TEXTAREA_X_OFFSET = 10;
    const TEXTAREA_WIDTH = 100;
    // ドロップダウン：検索対象レイヤー名
    window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET, 10, TEXTAREA_WIDTH, 25), "検索レイヤー");
    const srcLayerC: DropDownList = window.add("dropdownlist", createPositionBounds(TEXTAREA_WIDTH, 10, 250, 25), layerNames);
    srcLayerC.selection = 0;
    // チェックボックス：新規レイヤーかどうか
    const isNewLayerC: Checkbox = window.add("checkbox", createPositionBounds(TEXTAREA_X_OFFSET, 40, WINDOW_WIDTH, 65), "新規レイヤーを作成する");
    isNewLayerC.value = true;
    // テキストボックス：新規レイヤー名
    window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET, 70, TEXTAREA_WIDTH, 95), "新規レイヤー名");
    const newLayerNameC: EditText = window.add("edittext", createPositionBounds(TEXTAREA_WIDTH, 70, 250, 95), "色付き");
    // ドロップダウン：移動対象レイヤー名
    window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET, 100, TEXTAREA_WIDTH, 125), "移動先レイヤー");
    const destLayerC: DropDownList = window.add("dropdownlist", createPositionBounds(TEXTAREA_WIDTH, 100, 250, 125), layerNames);
    destLayerC.selection = 0;
    destLayerC.enabled = false;
    // UIフラグ管理
    isNewLayerC.onClick = function (): void {
        newLayerNameC.enabled = isNewLayerC.value;
        destLayerC.enabled = !isNewLayerC.value;
    };
    // ボタン：実行
    const okC: Button = window.add("button", createPositionBounds(10, 130, 110, 155), "OK");
    okC.onClick = function (): void {
        const entry = {
            srcLayerIndex: getIndex(srcLayerC.selection),
            isNewLayer: isNewLayerC.value,
            destLayerIndex: getIndex(destLayerC.selection),
            destLayerName: newLayerNameC.text
        };
        var state: boolean | string = checkState(entry);
        if (typeof state == "string") {
            alert(state);
            return;
        }
        process(entry);
        window.close();
    };
    // ボタン：キャンセル
    const cancelC: Button = window.add("button", createPositionBounds(150, 130, 250, 155), "キャンセル");
    cancelC.onClick = function (): void {
        window.close();
    };
    window.show();
}

/**
 * 矩形情報を基にBoundsを生成します。
 * @param x 左上の点のX座標
 * @param y 左上点のY座標
 * @param width 横幅
 * @param height 高さ
 * @returns Boundsの新しいインスタンス
 */
function createRectBounds(x: number, y: number, width: number, height: number): Bounds {
    return [x, y, width, height] as Bounds;
}

/**
 * 座標を基にBoundsを生成します。
 * @param left 左のX座標
 * @param top 上のY座標
 * @param right 右のX座標
 * @param bottom 下のY座標
 * @returns Boundsの新しいインスタンス
 */
function createPositionBounds(left: number, top: number, right: number, bottom: number): Bounds {
    return [left, top, right, bottom] as Bounds;
}

/**
 * レイヤー名一覧を取得します。
 * @returns レイヤー名一覧
 */
function getLayerNames(): string[] {
    const layers: Layers = app.activeDocument.layers;
    const result = new Array<string>(layers.length);
    for (var i = 0; i < result.length; i++) {
        result[i] = layers[i].name;
    }
    return result;
}

function process(entry: {
    srcLayerIndex: number,
    isNewLayer: boolean,
    destLayerIndex: number,
    destLayerName: string,
}): void {
    // @ts-ignore
    const location = ElementPlacement.PLACEATEND;
    const layers: Layers = app.activeDocument.layers;
    const srcLayer: Layer = layers[entry.srcLayerIndex];
    var destLayer: Layer
    if (entry.isNewLayer) {
        destLayer = layers.add();
        destLayer.name = entry.destLayerName;
    }
    else {
        destLayer = layers[entry.destLayerIndex];
    }
    var pathIndex = 0;
    while (pathIndex < srcLayer.pathItems.length) {
        var currentPath: PathItem = srcLayer.pathItems[pathIndex];
        var color = currentPath.strokeColor as RGBColor;
        if (currentPath.layer == srcLayer && (color.red != 0 || color.green != 0 || color.blue != 0)) {
            currentPath.move(destLayer, location);
        }
        else {
            pathIndex++;
        }
    }
}

function getIndex(value: number | ListItem): number {
    if (value instanceof ListItem) {
        return value.index;
    }
    return value;
}

function findLayer(name: string): Layer | null {
    const layers: Layers = app.activeDocument.layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].name == name) {
            return layers[i];
        }
    }
    return null;
}

function checkState(entry: {
    srcLayerIndex: number,
    isNewLayer: boolean,
    destLayerIndex: number,
    destLayerName: string,
}): boolean | string {
    if (entry.srcLayerIndex < 0) return "選択した検索レイヤーが無効です";
    if (entry.isNewLayer) {
        if (entry.destLayerName == "") return "新規レイヤー名を入力してください";
        if (findLayer(entry.destLayerName) != null) return "新規レイヤー名'" + entry.destLayerName + "'は既に存在します";
    }
    else {
        if (entry.destLayerIndex < 0) return "選択した移動先レイヤーが無効です";
    }
    return true;
}

migrate_color();
