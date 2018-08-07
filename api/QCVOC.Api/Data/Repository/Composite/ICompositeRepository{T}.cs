using System.Data;

namespace QCVOC.Server.Data.Repository.Composite
{
    public interface ICompositeRepository<T>
    {
        T Add(T composite, IDbTransaction transaction = null);

        void Remove(T composite, IDbTransaction transaction = null);
    }
}