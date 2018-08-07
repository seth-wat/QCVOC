namespace QCVOC.Server.Data.Repository.Composite
{
    using System;
    using QCVOC.Api.Data.ConnectionFactory;
    using QCVOC.Server.Data.Model.Composite;

    public class EventsServicesRepository : ICompositeRepository<EventsServices>
    {
        public EventsServicesRepository(IDbConnectionFactory dbConnectionFactory)
        {
            DbConnectionFactory = dbConnectionFactory;
        }

        private IDbConnectionFactory DbConnectionFactory { get; }

        public EventsServices Add(EventsServices composite)
        {
            throw new NotImplementedException();
        }

        public void Remove(EventsServices composite)
        {
            throw new NotImplementedException();
        }
    }
}