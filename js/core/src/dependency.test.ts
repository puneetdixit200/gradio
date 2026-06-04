import { describe, expect, test, vi } from "vitest";

vi.mock("@gradio/client", () => ({
	Client: class {}
}));

vi.mock("@gradio/statustracker", () => ({
	LoadingStatus: class {
		current = {};
		register = vi.fn();
		update = vi.fn();
		clear = vi.fn();
	}
}));

import { DependencyManager } from "./dependency";

function create_dependency_manager(
	update_state: (
		id: number,
		state: Record<string, unknown>,
		check_visibility?: boolean
	) => Promise<void>
): DependencyManager {
	return new DependencyManager(
		[],
		{} as never,
		update_state,
		async () => null,
		vi.fn(),
		vi.fn(),
		vi.fn(),
		vi.fn()
	);
}

describe("DependencyManager", () => {
	test("applies sibling output updates sequentially", async () => {
		const update_order: string[] = [];
		const manager = create_dependency_manager(async (id) => {
			update_order.push(`start-${id}`);
			if (id === 1) {
				await Promise.resolve();
			}
			update_order.push(`end-${id}`);
		});

		await manager.handle_data(
			[1, 2],
			[
				{ __type__: "update", visible: true },
				{ __type__: "update", visible: true }
			]
		);

		expect(update_order).toEqual(["start-1", "end-1", "start-2", "end-2"]);
	});
});
