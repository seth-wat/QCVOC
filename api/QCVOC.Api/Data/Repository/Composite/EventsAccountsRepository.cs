namespace QCVOC.Server.Data.Repository.Composite
{
    using System;
    using QCVOC.Api.Data.ConnectionFactory;
    using QCVOC.Server.Data.Model.Composite;

    public class EventsAccountsRepository : ICompositeRepository<EventsAccounts>
    {
        public EventsAccountsRepository(IDbConnectionFactory dbConnectionFactory)
        {
            DbConnectionFactory = dbConnectionFactory;
        }

        private IDbConnectionFactory DbConnectionFactory { get; }

        public EventsAccounts Add(EventsAccounts composite)
        {
            throw new NotImplementedException();
        }

        public void Remove(EventsAccounts composite)
        {
            throw new NotImplementedException();
        }
    }
}