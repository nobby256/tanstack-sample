import { Link } from "@tanstack/react-router"
import { Route } from "../route"

export function Page() {
	const items = Route.useLoaderData()

	return (
		<div>
			<h2>Results</h2>
			<ul>
				{items.map((item) => (
					<li key={item.id}>
						<Link to="/crud/$id" params={{ id: item.id }}>
							{item.name}
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
