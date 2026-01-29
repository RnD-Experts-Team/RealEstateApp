import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type NavCategory } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

interface NavMainCategorizedProps {
    categories: NavCategory[];
}

export function NavMainCategorized({ categories }: NavMainCategorizedProps) {
    return (
        <SidebarGroup>
            <SidebarMenu>
                {categories.map((category) => {
                    // If a category only has one item and its title matches the category title,
                    // render it as a direct link (no collapsible) so clicking opens the page immediately.
                    const onlyOne = category.items.length === 1 && category.title === category.items[0].title;

                    if (onlyOne) {
                        const item = category.items[0];
                        return (
                            <SidebarMenuItem key={category.title}>
                                <SidebarMenuButton tooltip={category.title} asChild>
                                    <Link href={item.href}>
                                        <category.icon />
                                        <span>{category.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <Collapsible key={category.title} defaultOpen={false} className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip={category.title}>
                                        <category.icon />
                                        <span>{category.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {category.items.map((item) => (
                                            <SidebarMenuSubItem key={item.title}>
                                                <SidebarMenuSubButton asChild>
                                                    <Link href={item.href}>
                                                        <item.icon />
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
