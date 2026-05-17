import { Link, useLocation } from "@tanstack/react-router"
import type { SummaryItem } from "./types"

type PageProps = {
	loaderData: SummaryItem[]
}

export function Page({ loaderData }: PageProps) {
	const location = useLocation()

	return (
		<div>
			<h2>Results</h2>
			<ul>
				{loaderData.map((item) => (
					<li key={item.id}>
						<Link
							to="/crud/detail/$id"
							params={{ id: item.id }}
							search={{ _returnTo: location.href }}
						>
							{item.name}
						</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
