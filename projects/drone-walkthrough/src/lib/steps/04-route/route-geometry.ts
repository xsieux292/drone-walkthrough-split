/**
 * 3.3.4 · Map geometry shared by the map part (drawing) and the step (cursor targets).
 *
 * All shapes are in MAP-IMAGE pixels of route/map.jpg (1024×640, satellite tiles around the
 * chiangrai-high field). The map layer is scaled by MAP_SCALE and shifted by MAP_DX inside the map
 * pane, which starts HEADER px below the top of the stage. toStage() converts a map point to stage px.
 *
 * Replacing the map image? Re-pick PAD / ROUTE / ORBIT / NO_FLY / LANDING / FIELD on the new image.
 */

export interface Pt {
  x: number;
  y: number;
}

export const MAP_SCALE = 0.87;
export const MAP_DX = -40;
/** Height of the planner header bar (stage px). */
export const HEADER = 44;

export const toStage = (p: Pt): Pt => ({ x: p.x * MAP_SCALE + MAP_DX, y: p.y * MAP_SCALE + HEADER });

/** Take-off pad (white square). */
export const PAD: Pt = { x: 640, y: 290 };
/** The straight route the animation draws, click by click (first point = pad). */
export const ROUTE: Pt[] = [PAD, { x: 572, y: 236 }, { x: 498, y: 268 }, { x: 440, y: 330 }];
/** Orbit circle around the main hall (centre + final radius). */
export const ORBIT = { x: 372, y: 303, r: 62 };
/** No-fly area (red), landing area (green), field boundary (white circle). */
export const NO_FLY = { x: 356, y: 290, w: 34, h: 26 };
export const LANDING = { x: 360, y: 344, w: 14, h: 14 };
export const FIELD = { x: 470, y: 330, r: 345 };

/** Where the two labels sit on the map (map px). */
export const LABELS = {
  route: { x: 520, y: 205, text: '1 · route A · 57 m', w: 118 },
  orbit: { x: 300, y: 378, text: '2 · orbit hall · 45 m', w: 128 },
};

/** Toolbar buttons, left to right. */
export const TOOLS = ['เลือก/แก้', 'จุด', 'เส้นตรง', 'เส้นโค้ง', 'วงกลม', 'กวาดพื้นที่'];
export const TOOL = { select: 0, point: 1, line: 2, curve: 3, circle: 4, sweep: 5 } as const;

/**
 * Centre of toolbar button i on the stage. Toolbar = map pane left 12 + padding 4, buttons 76 wide with 4 gap
 * (see .toolbar / .tool in planner-map.scss).
 */
export const toolAt = (i: number): Pt => ({ x: 12 + 4 + 38 + i * 80, y: HEADER + 12 + 4 + 15 });

/** The "บันทึก" button in the header (stage px). */
export const SAVE_BUTTON: Pt = { x: 905, y: 22 };
