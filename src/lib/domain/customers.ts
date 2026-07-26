export type CustomerDirectoryLike = {
  id: string;
  name: string;
  note: string | null;
  balance: number;
  updatedAt: string;
};

export type CustomerBalanceFilter = "all" | "unpaid" | "paid";

export const DEFAULT_CUSTOMER_PAGE_SIZE = 10;

export const summarizeCustomerDirectory = (customers: CustomerDirectoryLike[]) => {
  let unpaid = 0;
  let fullyPaid = 0;
  let totalOutstanding = 0;
  let highestOutstanding: {
    customerId: string;
    name: string;
    balance: number;
  } | null = null;

  for (const customer of customers) {
    const balance = customer.balance ?? 0;
    if (balance > 0) {
      unpaid += 1;
      totalOutstanding += balance;
      if (!highestOutstanding || balance > highestOutstanding.balance) {
        highestOutstanding = {
          customerId: customer.id,
          name: customer.name,
          balance,
        };
      }
    } else {
      fullyPaid += 1;
    }
  }

  return {
    total: customers.length,
    unpaid,
    fullyPaid,
    totalOutstanding,
    highestOutstanding,
  };
};

export const filterCustomers = <T extends CustomerDirectoryLike>(
  customers: T[],
  options: {
    search?: string;
    balanceFilter?: CustomerBalanceFilter;
  } = {},
): T[] => {
  const query = options.search?.trim().toLowerCase() ?? "";
  const balanceFilter = options.balanceFilter ?? "all";

  return customers.filter((customer) => {
    if (query) {
      const haystack = `${customer.name} ${customer.note ?? ""}`.toLowerCase();
      if (!haystack.includes(query)) {
        return false;
      }
    }

    if (balanceFilter === "unpaid" && !(customer.balance > 0)) {
      return false;
    }

    if (balanceFilter === "paid" && customer.balance > 0) {
      return false;
    }

    return true;
  });
};
