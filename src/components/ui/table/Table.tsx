'use client'

import React, { forwardRef, HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

/**
 * Generic Table component using semantic HTML table elements.
 * Provides a solid foundation for any tabular data with proper accessibility.
 */
const Table = forwardRef<
    HTMLTableElement,
    HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="relative w-full">
        <table
            ref={ref}
            className={cn(
                "w-full caption-bottom text-sm border-collapse table-fixed",
                className
            )}
            {...props}
        />
    </div>
))
Table.displayName = "Table"

/**
 * Table header container - wraps thead element
 */
const TableHeader = forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead
        ref={ref}
        className={cn(
            "",
            className
        )}
        {...props}
    />
))
TableHeader.displayName = "TableHeader"

/**
 * Table body container - wraps tbody element  
 */
const TableBody = forwardRef<
    HTMLTableSectionElement,
    HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn(
            "[&_tr:last-child]:border-0",
            className
        )}
        {...props}
    />
))
TableBody.displayName = "TableBody"

/**
 * Table row component with hover and selection states
 */
const TableRow = forwardRef<
    HTMLTableRowElement,
    HTMLAttributes<HTMLTableRowElement> & {
        highlighted?: boolean
    }
>(({ className, highlighted, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            highlighted && "bg-accent/20 hover:bg-accent/30",
            "data-[state=selected]:bg-muted",
            className
        )}
        {...props}
    />
))
TableRow.displayName = "TableRow"

/**
 * Table header cell with sorting support
 */
const TableHead = forwardRef<
    HTMLTableCellElement,
    ThHTMLAttributes<HTMLTableCellElement> & {
        sortable?: boolean
        sorted?: 'asc' | 'desc' | false
    }
>(({ className, children, sortable, sorted, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-12 px-1 text-left align-middle font-medium text-muted-foreground",
            "[&:has([role=checkbox])]:pr-0",
            sortable && "cursor-pointer select-none hover:text-foreground transition-colors",
            sorted && "text-foreground",
            className
        )}
        {...props}
    >
        <div className="flex items-center gap-2">
            {children}
            {sortable && (
                <div className="flex flex-col ml-1">
                    <svg
                        className={cn(
                            "h-3 w-3 transition-colors",
                            sorted === 'asc' ? "text-foreground" : "text-muted-foreground/50"
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 3l7 7h-4v7h-6v-7H3l7-7z" />
                    </svg>
                    <svg
                        className={cn(
                            "h-3 w-3 transition-colors -mt-1",
                            sorted === 'desc' ? "text-foreground" : "text-muted-foreground/50"
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 17l-7-7h4V3h6v7h4l-7 7z" />
                    </svg>
                </div>
            )}
        </div>
    </th>
))
TableHead.displayName = "TableHead"

/**
 * Table data cell component
 */
const TableCell = forwardRef<
    HTMLTableCellElement,
    TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            "p-1 align-middle [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
))
TableCell.displayName = "TableCell"

/**
 * Table caption for accessibility and descriptions
 */
const TableCaption = forwardRef<
    HTMLTableCaptionElement,
    HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn(
            "mt-4 text-sm text-muted-foreground",
            className
        )}
        {...props}
    />
))
TableCaption.displayName = "TableCaption"

export {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}