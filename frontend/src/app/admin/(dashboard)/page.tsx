import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { RecentOrders } from "@/components/recent-orders"
import { SectionCards } from "@/components/section-cards"

export default function Page() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <RecentOrders />
    </>
  )
}
