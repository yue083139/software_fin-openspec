import { fireEvent, render, screen } from "@testing-library/react";
import { Board } from "./Results";
import { TeamSettings } from "./Teacher";
import type { TeacherView } from "../types";

const teams = Array.from({ length: 50 }, (_, index) => `第${index + 1}組`);
const view: TeacherView = {
  role: "teacher",
  phase: "preparing",
  teams,
  joined: ["第50組"],
  source: "group.xlsx",
  questions: [{ number: 3, labels: [""] }],
  board: [],
  team_scores: {},
  team_play: false,
};

describe("五十組管理與結果", () => {
  it("組數上限為五十，且老師可操作第50組", () => {
    const calls: [string, unknown][] = [];
    render(<TeamSettings view={view} act={(path, body) => calls.push([path, body])} />);

    expect(screen.getByLabelText("組數")).toHaveAttribute("max", "50");
    expect(screen.getByText(/第50組/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "釋放" }));
    expect(calls).toEqual([["release", { team: "第50組" }]]);
  });

  it("結果表保留第1組至第50組欄位", () => {
    render(
      <Board
        board={[{ number: 3, labels: [""], ranking: [], winner: null }]}
        teams={teams}
        scores={{}}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "第1組" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "第50組" })).toBeInTheDocument();
  });
});
