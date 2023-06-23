/**
 * UIデータを表します。
 */
type UIEntry = {
    srcLayerIndex: number,
    isNewLayer: boolean,
    destLayerIndex: number,
    destLayerName: string,
    searchType: SearchType,
    pathType: PathType,
    color: RGBColor,
};

/**
 * 検索対象を表します。
 */
enum SearchType {
    /**
     * 塗り潰し色で検索
     */
    Fill = 0,
    /**
     * 外枠色で検索
     */
    Stroke = 1,
}

/**
 * 処理対象を表します。
 */
enum PathType {
    /**
     * 全てを処理
     */
    All = 0,
    /**
     * 縦棒のみ処理
     */
    VerticalOnly = 1,
    /**
     * 横棒のみ処理
     */
    HorizontalOnly = 2,
};

function migrate_color(): void {
    const layerNames: string[] = getLayerNames();

    // ウィンドウ
    const WINDOW_WIDTH = 270;
    const window = new Window("dialog", "色で分離", createPositionBounds(0, 0, WINDOW_WIDTH, 440));
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
    // ラジオボタン：検索方法
    window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET, 130, TEXTAREA_WIDTH, 155), "検索方法");
    const searchTypeC: RadioButton[] = addRadioButtons(window, getSearchTypeUITexts(), TEXTAREA_WIDTH, 135, 250, SearchType.Stroke);
    // ラジオボタン：検索対象
    window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET, 180, TEXTAREA_WIDTH, 215), "処理対象");
    const pathTypeC: RadioButton[] = addRadioButtons(window, getPathTypeUITexts(), TEXTAREA_WIDTH, 190, 250, PathType.HorizontalOnly);
    // 検索色
    window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET, 255, TEXTAREA_WIDTH, 285), "検索色");
    // const colorSample: StaticText = window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET + 60, 255, TEXTAREA_WIDTH, 285), "■");
    // colorSample.graphics.foregroundColor.color[0] = 0;
    // colorSample.graphics.foregroundColor.color[1] = 0;
    // colorSample.graphics.foregroundColor.color[2] = 0;
    window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET, 285, TEXTAREA_WIDTH, 315), "R");
    const colorRLabel: StaticText = window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET + 30, 285, TEXTAREA_WIDTH, 315), "0");
    const colorRC: Slider = window.add("slider", createPositionBounds(TEXTAREA_WIDTH, 285, 250, 315), 0, 0, 255);
    colorRC.onChanging = function (): void {
        colorRLabel.text = Math.floor(colorRC.value).toString();
    };
    colorRC.onChange = colorRC.onChanging;
    window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET, 315, TEXTAREA_WIDTH, 345), "G");
    const colorGLabel: StaticText = window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET + 30, 315, TEXTAREA_WIDTH, 345), "0");
    const colorGC: Slider = window.add("slider", createPositionBounds(TEXTAREA_WIDTH, 315, 250, 345), 0, 0, 255);
    colorGC.onChanging = function (): void {
        colorGLabel.text = Math.floor(colorGC.value).toString();
    };
    colorGC.onChange = colorGC.onChanging;
    window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET, 345, TEXTAREA_WIDTH, 375), "B");
    const colorBLabel: StaticText = window.add("statictext", createPositionBounds(TEXTAREA_X_OFFSET + 30, 345, TEXTAREA_WIDTH, 375), "0");
    const colorBC: Slider = window.add("slider", createPositionBounds(TEXTAREA_WIDTH, 345, 250, 375), 0, 0, 255);
    colorBC.onChanging = function (): void {
        colorBLabel.text = Math.floor(colorBC.value).toString();
    };
    colorBC.onChange = colorBC.onChanging;
    // UIフラグ管理
    isNewLayerC.onClick = function (): void {
        newLayerNameC.enabled = isNewLayerC.value;
        destLayerC.enabled = !isNewLayerC.value;
    };
    searchTypeC[0].onClick = function (): void {
        for (var i = 0; pathTypeC.length; i++) {
            pathTypeC[i].enabled = false;
        }
    };
    searchTypeC[1].onClick = function (): void {
        for (var i = 0; pathTypeC.length; i++) {
            pathTypeC[i].enabled = true;
        }
    };
    // ボタン：実行
    const okC: Button = window.add("button", createPositionBounds(10, 390, 110, 420), "OK");
    okC.onClick = function (): void {
        const entry: UIEntry = {
            srcLayerIndex: getIndex(srcLayerC.selection),
            isNewLayer: isNewLayerC.value,
            destLayerIndex: getIndex(destLayerC.selection),
            destLayerName: newLayerNameC.text,
            searchType: getRadioButtonsIndex(searchTypeC),
            pathType: getRadioButtonsIndex(pathTypeC),
            color: {
                red: Math.floor(colorRC.value),
                green: Math.floor(colorGC.value),
                blue: Math.floor(colorBC.value),
            },
        };
        var state: boolean | string = checkState(entry);
        if (typeof state == "string") {
            alert(state);
            return;
        }
        if (process(entry)) {
            window.close();
        }
    };
    // ボタン：キャンセル
    const cancelC: Button = window.add("button", createPositionBounds(150, 390, 250, 420), "キャンセル");
    cancelC.onClick = function (): void {
        window.close();
    };
    window.show();
}

/**
 * SearchTypeを表すUI表示文字列一覧を取得します。
 * @returns SearchTypeを表すUI表示文字列一覧
 */
function getSearchTypeUITexts(): string[] {
    const values: SearchType[] = [SearchType.Fill, SearchType.Stroke];
    const result = new Array<string>(values.length);
    for (var i = 0; i < result.length; i++) {
        switch (values[i]) {
            case SearchType.Fill:
                result[i] = "Fill";
                break;
            case SearchType.Stroke:
                result[i] = "Stroke";
                break;
            default:
                result[i] = "<INVALID>";
                break;
        }
    }
    return result;
}

/**
 * PathTypeを表すUI表示文字列一覧を取得します。
 * @returns PathTypeを表すUI表示文字列一覧
 */
function getPathTypeUITexts(): string[] {
    const values: PathType[] = [PathType.All, PathType.VerticalOnly, PathType.HorizontalOnly];
    const result = new Array<string>(values.length);
    for (var i = 0; i < result.length; i++) {
        switch (values[i]) {
            case PathType.All:
                result[i] = "全パスオブジェクト";
                break;
            case PathType.HorizontalOnly:
                result[i] = "横棒のみ";
                break;
            case PathType.VerticalOnly:
                result[i] = "縦棒のみ";
                break;
            default:
                result[i] = "<INVALID>";
                break;
        }
    }
    return result;
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
 * ラジオボタンを追加します。
 * @param window 追加先ウィンドウ
 * @param labels ラベル一覧
 * @param left 左のX座標
 * @param top 上のY座標
 * @param right 右のX座標
 * @param defaultIndex 最初に選択されるボタンのインデックス
 * @returns 追加されたラジオボタン一覧
 */
function addRadioButtons(window: Window, labels: string[], left: number, top: number, right: number, defaultIndex: number): RadioButton[] {
    const group: Group = window.add("group", createPositionBounds(left, top, right, top + 30 * labels.length));
    const result = new Array<RadioButton>(labels.length);
    const width: number = right - left;
    for (var i = 0; i < result.length; i++) {
        var y: number = i * 25;
        result[i] = group.add("radiobutton", createPositionBounds(0, y, width, y + 25), labels[i]);
        result[i].value = false;
    }
    result[defaultIndex].value = true;
    return result;
}

/**
 * 選択されているラジオボタンのインデックスを取得します。
 * @param buttons 対象のラジオボタン一覧
 * @returns buttonsのうち選択されているもののインデックス
 */
function getRadioButtonsIndex(buttons: RadioButton[]): number {
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].value) {
            return i;
        }
    }
    return -1;
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

/**
 * 分離の処理を実行します。
 * @param entry フォームデータ
 * @returns スクリプトを終了する場合はtrue，それ以外でfalse
 */
function process(entry: UIEntry): boolean {
    // @ts-ignore
    const location = ElementPlacement.PLACEATEND;
    const layers: Layers = app.activeDocument.layers;
    const srcLayer: Layer = layers[entry.srcLayerIndex];
    var destLayer: Layer;
    if (entry.isNewLayer) {
        // 移動先レイヤーの生成
        destLayer = layers.add();
        destLayer.name = entry.destLayerName;
    }
    else {
        // 移動先レイヤーの取得
        destLayer = layers[entry.destLayerIndex];
    }
    var pathIndex = 0;
    var movedCount = 0;
    while (pathIndex < srcLayer.pathItems.length) {
        var currentPath: PathItem = srcLayer.pathItems[pathIndex];

        // 色の条件
        var color: Color;
        switch (entry.searchType) {
            case SearchType.Fill:
                color = currentPath.fillColor;
                break;
            case SearchType.Stroke:
                color = currentPath.strokeColor;
                break;
            default:
                alert("選択した検索対象が無効です");
                destLayer.remove();
                return false;
        }
        var willMove: boolean;
        if (entry.searchType == SearchType.Fill) {
            entry.pathType = PathType.All;
        }

        // 処理対象
        switch (entry.pathType) {
            case PathType.All:
                willMove = isSameColor(entry.color, color);
                break;
            case PathType.VerticalOnly:
                willMove = isVerticalLine(currentPath) && isSameColor(entry.color, color);
                break;
            case PathType.HorizontalOnly:
                willMove = isHorizontalLine(currentPath) && isSameColor(entry.color, color);
                break;
            default:
                alert("選択した処理対象が無効です");
                destLayer.remove();
                return false;
        }

        // 色や処理対象の条件に適合するものを対象レイヤーへ移動
        if (currentPath.layer == srcLayer && willMove) {
            currentPath.move(destLayer, location);
            movedCount++;
        }
        else {
            pathIndex++;
        }
    }
    if (movedCount == 0) {
        alert("対象オブジェクトがありません");
        destLayer.remove();
        return false;
    }
    return true;
}

/**
 * DropDownListのエントリーのインデックスを取得します。
 * @param value インデックスを取得するエントリー
 * @returns valueの表すイデックス
 */
function getIndex(value: number | ListItem): number {
    if (value instanceof ListItem) {
        return value.index;
    }
    return value;
}

/**
 * 指定した名前に一致するレイヤーを検索します。
 * @param name レイヤー名
 * @returns nameに一致する名前のレイヤーのインスタンス
 */
function findLayer(name: string): Layer | null {
    const layers: Layers = app.activeDocument.layers;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].name == name) {
            return layers[i];
        }
    }
    return null;
}

/**
 * UIEntryの値のチェックを行います。
 * @param entry 検証するインスタンス
 * @returns entryの値に問題がある場合はエラーメッセージ，それ以外でtrue
 */
function checkState(entry: UIEntry): true | string {
    if (entry.srcLayerIndex < 0) return "選択した検索レイヤーが無効です";
    if (entry.isNewLayer) {
        if (entry.destLayerName == "") return "新規レイヤー名を入力してください";
        if (findLayer(entry.destLayerName) != null) return "新規レイヤー名'" + entry.destLayerName + "'は既に存在します";
    }
    else {
        if (entry.destLayerIndex < 0) return "選択した移動先レイヤーが無効です";
        if (entry.srcLayerIndex == entry.destLayerIndex) return "移動先レイヤーが同じです";
    }
    return true;
}

/**
 * 指定したPathItemが縦棒を表すかどうかを取得します。
 * @param item 対象のPathItemのインスタンス
 * @returns itemが縦棒を表す場合はtrue，それ以外でfalse
 */
function isVerticalLine(item: PathItem): boolean {
    const points: PathPoints = item.pathPoints;
    // アンカー数が2且つ両X座標が同じ
    return points.length == 2 && points[0].anchor[0] == points[1].anchor[0];
}

/**
 * 指定したPathItemが横棒を表すかどうかを取得します。
 * @param item 対象のPathItemのインスタンス
 * @returns itemが横棒を表す場合はtrue，それ以外でfalse
 */
function isHorizontalLine(item: PathItem): boolean {
    const points: PathPoints = item.pathPoints;
    // アンカー数が2且つ両Y座標が同じ
    return points.length == 2 && points[0].anchor[1] == points[1].anchor[1];
}

/**
 * 色の比較を行います。
 * @param rgb 元となるRGBカラー
 * @param comparison 比較対象のカラー
 * @returns rgbとcomparisonが同色を表す場合はtrue，それ以外でfalse
 */
function isSameColor(rgb: RGBColor, comparison: Color) {
    if (comparison instanceof NoColor) {
        return false;
    }
    if (comparison instanceof RGBColor) {
        return rgb.red == comparison.red
            && rgb.green == comparison.green
            && rgb.blue == comparison.blue;
    }
    if (comparison instanceof CMYKColor) {
        return rgb.red == 255 * (1 - comparison.cyan) * (1 - comparison.black)
            && rgb.green == 255 * (1 - comparison.magenta) * (1 - comparison.black)
            && rgb.blue == 255 * (1 - comparison.yellow) * (1 - comparison.black);
    }
    if (comparison instanceof GrayColor) {
        const gray = Math.floor(comparison.gray * 255 / 100);
        return rgb.red == gray
            && rgb.green == gray
            && rgb.blue == gray;
    }
    // TODO: 他のカラーへの対応
    return false;
}

migrate_color();
